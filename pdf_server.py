# Flask Imports
from flask import Flask, request, url_for, render_template, make_response #, session, redirect, g, abort, flash
# Naked - Used to run node calls for d3 scripts
from Naked.toolshed.shell import muterun_js
# flask_weasyprint for generating the PDFs
from flask_weasyprint import HTML, render_pdf
## python imports
# used to encode svg images as data-url data
from base64 import b64encode
# json handling
import json
# file pathing
from os import path as path
# used to escape/quote JSON for command line calls to node scripts
from pipes import quote
# Used to import and compile intermediary scripts
import imp
##
import logging

import sys
reload(sys)
sys.setdefaultencoding("utf-8")

# configure debug mode
DEBUG = True

# application
app = Flask(__name__)
app.config.from_object(__name__)

app.jinja_options = {
    'extensions': [
        'jinja2.ext.autoescape',
        'jinja2.ext.with_',
        'jinja2.ext.loopcontrols'
    ]
}

## Pass base64encode function to jinja as a filter
app.jinja_env.filters['base64encode'] = b64encode

## Helpful accessor function used in jinja templates to build lists (ul)
def list_values(l):
    return [l[k]["value"] for k in l if l[k]["value"] != ""]

app.jinja_env.filters['list_values'] = list_values

### Routes
# download route - returns a pdf document as attachment with cookie header 
@app.route("/download", methods = ["GET", "POST"])
def download():
    # Get report
    report = _render_request(request)

    # turn Flask rendered response into WeasyPrint HTML Object
    report_html_object = HTML(string = report)

    # render html object into PDF
    report_pdf = render_pdf(report_html_object)

    # Return pdf as download attachment  w/ cookie - for use with the jquery.FileDownload plugin
    response = make_response(report_pdf)
    response.headers["Content-Disposition"] = "attachment; filename=town_profile.pdf"
    response.headers["Set-Cookie"] = "fileDownload=true; path=/"

    return response

# view route - returns report directly to calling page as html
@app.route("/view", methods = ["GET", "POST"])
def view():
    return _render_request(request)

@app.route('/status', methods = ['GET'])
def status():
    return json.dumps({'status': 'ok', 'status_code': 200})

# "Internal" function that is used to actually do the request process
def _render_request(request):
    request_data = json.loads(request.form["data"])
    # Pull template name request
    pdf_template = request_data["template"]

    ## get intermediary processing script specific for this template`
    intermediary_script = imp.load_source('intermediary', 'scripts/intermediate/'+pdf_template+'.py')
    
    # pull extra information from intermediary script
    #   - this should be data that will need lookups, but won't be included in the request from CKAN (ie, town hall address for CERC Town Profiles)
    intermediate_script_reference_info = intermediary_script.get_info(request_data)

    # config options should be passed in to the request as part of the json - under "config" - and should be an object of key:value pairs
    # other config options (such as color schemes) will be loaded dynamically from static json files that share a name with the template
    template_config = {}
    if (path.isfile(path.join("static", pdf_template+".json"))):
        template_config = json.load(open(path.join("static", pdf_template+".json")))

    # Add any template-level config params from request
    template_config.update(request_data["config"])

    # Get extra objects - ones that will be present for all requests for this template that don't need to be included in the json passed in through POST
    #       ie. CERC Town Profiles - the map in the header
    request_data["objects"].extend(intermediary_script.get_extra_obj(request_data))

    # build vis objects
    objects = {}

    for request_obj in request_data["objects"]:
        obj = {}

        # Every intermediary script should have one transformation method for each type of viz [pie, map, bar, table]
        request_obj = intermediary_script.transformations[request_obj["type"]](request_obj)

        # take a copy of the template-level config and update with visualization-level configs for this object
        config = template_config.copy()
        config.update(request_obj["config"])

        ## This is as clean as can be right now. We need either
        ##      a) a way to turn a dictionary into CL args ie
        ##              {"data" : quote(json.dumps(requestObj["data"])), "config" : quote(json.dumps(config))} -> "--data=stuff --config=things"
        ##  or
        ##      b) A class for creating our node calls, probably preferable and neater, easier to maintain etc.

        cl_script = "scripts/visualizations/"+request_obj["type"]+".js"
        cl_data = "--data="+quote(json.dumps(request_obj["data"]))
        cl_config = "--config="+quote(json.dumps(config))
        cl_tablename = "--tablename="+quote(request_obj['name'])

        node_response = muterun_js(cl_script, cl_data+" "+cl_config+" "+cl_tablename)
        # app.logger.info(node_response.stdout)
        # app.logger.info(node_response.stderr)
        # # Useful debugging - change if clause to be whatever type of chart you're debugging
        # if(requestObj['type'] == "table"):
        #     print("###############")
        #     print(requestObj["name"])
        #     print("###############")
        #     print(nodeResponse.stdout)
        #     print(nodeResponse.stderr)
        #     print(nodeResponse.exitcode)

        obj["output"] = render_template(request_obj["type"]+".html", data = node_response.stdout)

        obj["className"] = request_obj["type"];
        obj["config"] = request_obj["config"];
        obj["dump"] = node_response.stdout
        obj["data"] = request_obj["data"]
        objects[request_obj["name"]] = obj
        # app.logger.info(json.dumps(objects))

    # render template
    response = render_template(pdf_template+".html", config = template_config, info = intermediate_script_reference_info, objects = objects)

    return response


# run the application to public server
if __name__ == "__main__":
    app.logger.addHandler(logging.StreamHandler())
    app.logger.setLevel(logging.INFO)
    app.run(host="0.0.0.0", debug=True)
