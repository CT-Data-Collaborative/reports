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

# Routes
@app.route("/")
def index():
    return render_template("base.html", title = "Hello World!", body="This is body content.")

@app.route("/post", methods=["GET", "POST"])
def post_test():
    # # This works just fine, however i don't think it's the best option because we will need to 
    # # Have a predetermined set of objects/names/keys in our POST data.
    # return str(request.form.getlist("apples[]"))
    # return str(request.form.getlist("types[Maccoun][]"))
    # return str(request.form)
    
    # # In theory - we should be able to get requests as JSON directly from the requests object but I can't get it to work.
    # r = request.get_json()
    # return str(r)
    
    ## another json request route - more manual, but it works!
    # data = json.loads(request.form["data"])
    # print(str(data))

    # data = {"apples":[53245, 28479, 19697, 24037, 40245]}
    # print(request.form)
    data = {"apples" : request.args.getlist("apples[]")}
    svgImage = muterun_js('scripts/donut.js', "--data="+quote(json.dumps(data)))
    response = HTML(string=render_template("test.html", data=svg2data_url(svgImage.stdout))).write_pdf()
    response = make_response(response)
    response.headers["Content-Disposition"] = "attachment; filename=foo.pdf"
    return response

@app.route("/form", methods=["GET", "POST"])
def form():
    print(request.method)
    if(request.method == "GET"):
        return render_template("form.html");
    else:
        req = json.loads(request.form["data"])
    
    objects = []
    for requestObj in req["objects"]:
        obj = {}

        # in the future we should just have these available for every type of chart we expect from every application use case
        # so we don't have to check, we just ALWAYS call:
        #        ` requestObj["data"] = transform_data(requestObj["data"], requestObj["type"])  `
        if (requestObj["type"] == "table"):
            requestObj["data"] = intermediary.transform_data(requestObj["data"], "table")

        nodeResponse = muterun_js('scripts/visualizations/'+requestObj["type"]+'.js', "--data="+quote(json.dumps(requestObj["data"])))

        obj["output"] = render_template(requestObj["type"]+".html", data = nodeResponse.stdout)

        obj["className"] = requestObj["type"];
        obj["dump"] = nodeResponse.stdout
        obj["data"] = requestObj["data"]
        objects.append(obj);

    return render_template("form_output.html", objects = objects)
    # pdfResponse = HTML(string=render_template("town_profile.html", objects = objects)).write_pdf()
    # pdfResponse = make_response(pdfResponse)
    # pdfResponse.headers["Content-Disposition"] = "attachment; filename=town_profile.pdf"
    # return pdfResponse

@app.route("/town_profile", methods=["GET", "POST"])
def town_profile():
    # build vis objects
    req = json.loads('{"template":"town_profile","objects":[{"type":"table","name":"race","data":[["","Hartford","Connecticut"],["American Indian and Alaska Native Alone",596,8770],["Black or African American Alone",47786,361668],["Hispanic or Latino",54289,496939],["White Alone",43660,2792554],["White Alone, Not Hispanic or Latino",20892,2526401]],"config":{}},{"type":"table","name":"population","data":[["","Hartford","Connecticut"],[2015,125999,3644545],[2020,126656,3702469],[2025,126185,3746181]],"config":{}},{"type":"table","name":"age","data":[["","0 to 4 years","10 to 14 years","15 to 19 years","20 to 24 years","25 to 29 years","30 to 34 years","35 to 44 years","45 to 54 years","55 to 64 years","5 to 9 years","65 to 74 years","75 to 84 years","85 years and over","Total"],["Hartford",8487,8613,12832,12571,10721,9165,14801,14919,11710,9184,6968,3514,1645,125130],["Connecticut",197395,236742,255816,229708,217169,211089,469746,568510,456963,220139,269422,164260,86602,3583561]],"config":{}}]}')

    objects = {}
    for requestObj in req["objects"]:
        obj = {}

        # in the future we should just have these available for every type of chart we expect from every application use case
        # so we don't have to check, we just ALWAYS call:
        #        ` requestObj["data"] = transform_data(requestObj["data"], requestObj["type"])  `
        if (requestObj["type"] == "table"):
            requestObj["data"] = intermediary.transform_data(requestObj["data"], "table")

        nodeResponse = muterun_js('scripts/visualizations/'+requestObj["type"]+'.js', "--data="+quote(json.dumps(requestObj["data"])))

        obj["output"] = render_template(requestObj["type"]+".html", data = nodeResponse.stdout)

        obj["className"] = requestObj["type"];
        obj["dump"] = nodeResponse.stdout
        obj["data"] = requestObj["data"]
        objects[requestObj["name"]] = obj

    # render template
    response = render_template("town_profile.html", objects = objects)

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
