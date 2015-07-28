from Naked.toolshed.shell import run_js
from base64 import b64encode
from jinja2 import Template

# helper for encoding svg so that we can hand off to weasy

def svg2data_url(value):
        return "data:image/svg+xml;charset=utf-8;base64,"+b64encode(value)

# call node
success = run_js('donut.js')

# print svg
print(success)

# print encoded svg
print (svg2data_url(success))

template = Template('<!DOCTYPE html><html lang="en"><head><title>Report Test</title></head><body><h1> CERC Town Profile</h1>{{ svg }}</body></html>')
template.render(svg=success)