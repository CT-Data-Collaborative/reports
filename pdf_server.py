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

# configure
DEBUG = True

# application
app = Flask(__name__)
app.config.from_object(__name__)

def svg2data_url(value):
        return "data:image/svg+xml;charset=utf-8;base64,"+b64encode(value)

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


# run the application to public server
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9999, debug=True)
