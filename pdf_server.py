# Imports for Flask
from flask import Flask, request, url_for, render_template, make_response #, session, redirect, g, abort, flash
##

## Imports that i'm testing code for
from Naked.toolshed.shell import muterun_js
from base64 import b64encode
# from weasyprint import HTML, CSS
from flask_weasyprint import HTML, render_pdf
import json, os
from pipes import quote
## 

## This is a test of the intermediary data transformation step
import imp
intermediary = imp.load_source('intermediary', 'scripts/intermediate_test.py')

# configure
DEBUG = True

# application
app = Flask(__name__)
app.config.from_object(__name__)

app.jinja_env.filters['base64encode'] = b64encode

## Helpful accessor function used in jinja templates
def listValues(l):
    return [o["value"] for o in l if o["value"] != ""]
app.jinja_env.filters['listValues'] = listValues

# Routes
@app.route("/download", methods = ["GET", "POST"])
def download():
    # Get report
    report = renderRequest(request)

    ## Return PDF as pdf file
    response = HTML(string=report)
    response = render_pdf(response)

    # # Return pdf as download attachment - for use with the jquery.FileDownload plugin
    # response = HTML(string=render_template("town_profile.html", config = templateConfig, info = info, objects = objects))
    # response = render_pdf(response)
    # response = make_response(response)
    # response.headers["Content-Disposition"] = "attachment; filename=town_profile.pdf"
    # response.headers["Set-Cookie"] = "fileDownload=true; path=/"

    return response

@app.route("/view")
def view():
    return renderRequest(request)

@app.route("/form", methods=["GET", "POST"])
def form():
    print(request.method)
    if(request.method == "GET"):
        return render_template("form.html");
    else:
        req = json.loads(request.form["data"])

        template = req["template"]
        info = intermediary.get_info(req)
        # config options should be passed in to the request as part of the json - under "config" - and should be an object of key:value pairs
        # other config options (such as color schemes) will be loaded dynamically from static json files that share a name with the template
        templateConfig = {}
        if (os.path.isfile(os.path.join("static", template+".json"))):
            templateConfig = json.load(open(os.path.join("static", template+".json")))
    
        # Add any template-level config params from request
        templateConfig.update(req["config"])

        # Get extra objects - ones that will be present for all requests for this template that don't need to be included in the json passed in through POST
        req["objects"].extend(intermediary.get_extra_obj(req))

        # build vis objects
        objects = {}
        for requestObj in req["objects"]:
            obj = {}

            # in the future we should just have these available for every type of chart we expect from every application use case
            # so we don't have to check, we just ALWAYS call:
            #        ` requestObj["data"] = transform_data(requestObj, requestObj["type"])  `
            if (requestObj["type"] == "table"):
                requestObj["data"] = intermediary.transform_data(requestObj, "table")

            # merge template config with specific configs for this object
            config = templateConfig.copy()
            config.update(requestObj["config"])

            nodeResponse = muterun_js('scripts/visualizations/'+requestObj["type"]+'.js', "--data="+quote(json.dumps(requestObj["data"]))+" --config="+quote(json.dumps(config)))

            # if(requestObj['type'] == "map"):
            #     print(nodeResponse.stdout)
            #     print(nodeResponse.stderr)
            #     print(nodeResponse.exitcode)

            obj["output"] = render_template(requestObj["type"]+".html", data = nodeResponse.stdout)

            obj["className"] = requestObj["type"];
            obj["dump"] = nodeResponse.stdout
            obj["data"] = requestObj["data"]
            objects[requestObj["name"]] = obj

        # render template
        # return render_template("form_output.html", objects = objects)
        pdfResponse = HTML(string=render_template("town_profile.html", config = templateConfig, info = info, objects = objects))
        pdfResponse = render_pdf(pdfResponse)
        pdfResponse = make_response(pdfResponse)
        pdfResponse.headers["Content-Disposition"] = "attachment; filename=town_profile.pdf"
        pdfResponse.headers["Set-Cookie"] = "fileDownload=true; path=/"
        return pdfResponse

@app.route("/town_profile", methods=["GET", "POST"])
def town_profile():
    mockJSON = open("static/mock.json")
    mockJSON = json.load(mockJSON)

    # Somehow return "/download" view endpoint with data = {"data" : mockJSON} as post param?
    return "Hello World"

def renderRequest(request):
    # req = json.loads('{"template":"town_profile","objects":[{"type":"table","name":"race","data":[["","Hartford","Connecticut"],["Native American",596,8770],["Black",47786,361668],["Hispanic (any race)",54289,496939],["White",43660,2792554]],"config":{}},{"type":"table","name":"population","data":[["","Hartford","Connecticut"],[2015,125999,3644545],[2020,126656,3702469],[2025,126185,3746181]],"config":{}},{"type":"table","name":"age","data":[["","0-4","5-9","10-14","15-19","20-24","25-29","30-34","35-44","...","Total"],["Hartford",8487,9184,8613,12832,12571,10721,9165,14801,"...",125130],["Connecticut",197395,220139,236742,255816,229708,217169,211089,469746,"...",3583561]],"config":{}}]}')

    # req = json.loads('{"template":"town_profile","objects":[{"type":"pie","name":"race","data":[["Q1",26],["Q2",58],["Q3",46],["Q4",32]],"config":{}},{"type":"table","name":"population","data":[["","Hartford","Connecticut"],[2015,125999,3644545],[2020,126656,3702469],[2025,126185,3746181]],"config":{}},{"type":"table","name":"age","data":[["","0-4","5-9","10-14","15-19","20-24","25-29","30-34","35-44","...","Total"],["Hartford",8487,9184,8613,12832,12571,10721,9165,14801,"...",125130],["Connecticut",197395,220139,236742,255816,229708,217169,211089,469746,"...",3583561]],"config":{}}]}')
    
    # req = json.loads('{"template":"town_profile","objects":[{"type":"pie","name":"population","data":[["Q1",26],["Q2",58],["Q3",46],["Q4",32]],"config":{}},{"type":"map","name":"race","data":[],"config":{}},{"type":"table","name":"age","data":[["","0-4","5-9","10-14","15-19","20-24","25-29","30-34","35-44","...","Total"],["Hartford",8487,9184,8613,12832,12571,10721,9165,14801,"...",125130],["Connecticut",197395,220139,236742,255816,229708,217169,211089,469746,"...",3583561]],"config":{}}]}')
    
    # req = json.loads('{"template":"town_profile","objects":[{"type":"bar","name":"population","data":[["Q1",26],["Q2",58],["Q3",46],["Q4",32]],"config":{}},{"type":"map","name":"race","data":[],"config":{}},{"type":"table","name":"age","data":[["","0-4","5-9","10-14","15-19","20-24","25-29","30-34","35-44","...","Total"],["Hartford",8487,9184,8613,12832,12571,10721,9165,14801,"...",125130],["Connecticut",197395,220139,236742,255816,229708,217169,211089,469746,"...",3583561]],"config":{}}]}')
    
    # Town profile mock json request has been moved to it's own file.
    # req = open("static/mock.json")
    # req = json.load(req)
    req = json.loads(request.form["data"])

    # Pull template name out of config file
    template = req["template"]
    
    # pull extra information?
    info = intermediary.get_info(req)

    # config options should be passed in to the request as part of the json - under "config" - and should be an object of key:value pairs
    # other config options (such as color schemes) will be loaded dynamically from static json files that share a name with the template
    templateConfig = {}
    if (os.path.isfile(os.path.join("static", template+".json"))):
        templateConfig = json.load(open(os.path.join("static", template+".json")))

    # Add any template-level config params from request
    templateConfig.update(req["config"])

    # Get extra objects - ones that will be present for all requests for this template that don't need to be included in the json passed in through POST
    req["objects"].extend(intermediary.get_extra_obj(req))

    # build vis objects
    objects = {}
    for requestObj in req["objects"]:
        obj = {}

        # in the future we should just have these available for every type of chart we expect from every application use case
        # so we don't have to check, we just ALWAYS call:
        #        ` requestObj["data"] = transform_data(requestObj, requestObj["type"])  `
        if (requestObj["type"] == "table"):
            requestObj["data"] = intermediary.transform_data(requestObj, "table")

        # merge template config with specific configs for this object
        config = templateConfig.copy()
        config.update(requestObj["config"])

        nodeResponse = muterun_js('scripts/visualizations/'+requestObj["type"]+'.js', "--data="+quote(json.dumps(requestObj["data"]))+" --config="+quote(json.dumps(config)))

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
        obj["dump"] = nodeResponse.stdout
        obj["data"] = requestObj["data"]
        objects[requestObj["name"]] = obj

    # render template
    response = render_template(template+".html", config = templateConfig, info = info, objects = objects)

    # Temporarily using a get parameter ("print" = true)
    # should be using request.method == POST, as commented out below.
    # Or just returning print version by default, if we don't keep a screen view here.
    # if request.method == "POST":
    if request.args.get("print", default = False):
        response = HTML(string=response)
        response = render_pdf(response)

    return response


# run the application to public server
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9999, debug=True)
