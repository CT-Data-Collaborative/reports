from Naked.toolshed.shell import muterun_js
from base64 import b64encode
from jinja2 import Template, Environment, FileSystemLoader
from weasyprint import HTML
import json
# helper for encoding svg so that we can hand off to weasy

def svg2data_url(value):
        return "data:image/svg+xml;charset=utf-8;base64,"+b64encode(value)

# call node
data = {"apples":[53245, 28479, 19697, 24037, 40245]}
success = muterun_js('donut.js', "--data=\""+json.dumps(data)+"\"")

# print svg
# print(success.stdout)

# print encoded svg
# print (svg2data_url(success.stdout))

# inline template
# template = Template('<!DOCTYPE html><html lang="en"><head><title>Report Test</title></head><body><h1> CERC Town Profile</h1><img src="{{ encoded_svg }}"></img></body></html>')
# rendered_template = template.render(encoded_svg=svg2data_url(success.stdout))

# use jinja's Environment and loaders on external template
env = Environment(loader=FileSystemLoader("/vagrant/reports/templates/html"))
template = env.get_template("test.html")

print(template.render(data = svg2data_url(success.stdout)))

# write to pdf
# HTML(string=rendered_template).write_pdf('jinjatest.pdf')
