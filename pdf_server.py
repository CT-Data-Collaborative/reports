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

import sys
reload(sys)
sys.setdefaultencoding("utf-8")

# configure debug mode
DEBUG = True

# application
app = Flask(__name__)
app.config.from_object(__name__)

## Pass base64encode function to jinja as a filter
app.jinja_env.filters['base64encode'] = b64encode

## Helpful accessor function used in jinja templates to build lists (ul)
def listValues(l):
    return [l[k]["value"] for k in l if l[k]["value"] != ""]

app.jinja_env.filters['listValues'] = listValues

### Routes
# download route - returns a pdf document as attachment with cookie header 
@app.route("/download", methods = ["GET", "POST"])
def download():
    # Get report
    report = renderRequest(request)
    # turn Flask rendered response into WeasyPrint HTML Object
    report = HTML(string = report)
    # render html object into PDF
    report = render_pdf(report)
    # Return pdf as download attachment  w/ cookie - for use with the jquery.FileDownload plugin
    response = make_response(report)
    response.headers["Content-Disposition"] = "attachment; filename=town_profile.pdf"
    response.headers["Set-Cookie"] = "fileDownload=true; path=/"

    return response

# view route - returns report directly to calling page as html
@app.route("/view", methods = ["GET", "POST"])
def view():
    return renderRequest(request)

# "Internal" function that is used to actually do the request process
def renderRequest(request):
    # Pull json out of request object, parse as JSON
    req = json.loads(request.form["data"])

    # Pull template name request
    template = req["template"]

    ## get intermediary processing script specific for this template`
    intermediary = imp.load_source('intermediary', 'scripts/intermediate/'+template+'.py')
    
    # pull extra information from intermediary script
    #   - this should be data that will need lookups, but won't be included in the request from CKAN (ie, town hall address for CERC Town Profiles)
    info = intermediary.get_info(req)

    # config options should be passed in to the request as part of the json - under "config" - and should be an object of key:value pairs
    # other config options (such as color schemes) will be loaded dynamically from static json files that share a name with the template
    templateConfig = {}
    if (path.isfile(path.join("static", template+".json"))):
        templateConfig = json.load(open(path.join("static", template+".json")))

    # Add any template-level config params from request
    templateConfig.update(req["config"])

    # Get extra objects - ones that will be present for all requests for this template that don't need to be included in the json passed in through POST
    #       ie. CERC Town Profiles - the map in the header
    req["objects"].extend(intermediary.get_extra_obj(req))

    # build vis objects
    objects = {}
    for requestObj in req["objects"]:
        obj = {}

        # Every intermediary script should have one transformation method for each type of viz [pie, map, bar, table]
        requestObj = intermediary.transformations[requestObj["type"]](requestObj)

        # take a copy of the template-level config and update with visualization-level configs for this object
        config = templateConfig.copy()
        config.update(requestObj["config"])

        ## This is as clean as can be right now. We need either
        ##      a) a way to turn a dictionary into CL args ie
        ##              {"data" : quote(json.dumps(requestObj["data"])), "config" : quote(json.dumps(config))} -> "--data=stuff --config=things"
        ##  or
        ##      b) A class for creating our node calls, probably preferable and neater, easier to maintain etc.

        clScript = "scripts/visualizations/"+requestObj["type"]+".js"
        clData = "--data="+quote(json.dumps(requestObj["data"]))
        clConfig = "--config="+quote(json.dumps(config))

        nodeResponse = muterun_js(clScript, clData+" "+clConfig)

        # # Useful debugging - change if clause to be whatever type of chart you're debugging
        # if(requestObj['type'] == "table"):
        #     print("###############")
        #     print(requestObj["name"])
        #     print("###############")
        #     print(nodeResponse.stdout)
        #     print(nodeResponse.stderr)
        #     print(nodeResponse.exitcode)

        obj["output"] = render_template(requestObj["type"]+".html", data = nodeResponse.stdout)

        obj["className"] = requestObj["type"];
        obj["config"] = requestObj["config"];
        obj["dump"] = nodeResponse.stdout
        obj["data"] = requestObj["data"]
        objects[requestObj["name"]] = obj

    # render template
    response = render_template(template+".html", config = templateConfig, info = info, objects = objects)

    return response


# run the application to public server
if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=False)
    # app.run(host="0.0.0.0", port=9999, debug=True)
