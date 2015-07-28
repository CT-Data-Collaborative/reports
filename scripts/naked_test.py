from Naked.toolshed.shell import run_js
from base64 import b64encode

# helper for encoding svg so that we can hand off to weasy

def svg2data_url(value):
        return "data:image/svg+xml;charset=utf-8;base64,"+b64encode(value)

# call node
success = run_js('donut.js')

# print svg
print(success)

# print encoded svg
print (svg2data_url(success))