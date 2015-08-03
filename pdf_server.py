# Imports for Flask
from flask import Flask, request, url_for, render_template, make_response #, session, redirect, g, abort, flash
##

## Imports that i'm testing code for
from Naked.toolshed.shell import muterun_js
from base64 import b64encode
from weasyprint import HTML
import json
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

# @app.route("/town_profile", methods=["GET", "POST"])
# def town_profile():
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

    return render_template("town_profile.html", objects = objects)
    # pdfResponse = HTML(string=render_template("town_profile.html", objects = objects)).write_pdf()
    # pdfResponse = make_response(pdfResponse)
    # pdfResponse.headers["Content-Disposition"] = "attachment; filename=town_profile.pdf"
    # return pdfResponse


# run the application to public server
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9999, debug=True)
