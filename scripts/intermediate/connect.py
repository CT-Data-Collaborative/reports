import json

import random
def random_hex_color():
    r = lambda: random.randint(0,255)
    return('#%02X%02X%02X' % (r(),r(),r()))

def table(visObj):
    visObj["config"]["class"] = "col-md-{width} row-md-{height}".format(width = visObj["config"]["width"], height = visObj["config"]["height"])
    visObj["config"]["color"] = random_hex_color()
    return visObj

def pie(visObj):
    visObj["config"]["class"] = "col-md-{width} row-md-{height}".format(width = visObj["config"]["width"], height = visObj["config"]["height"])
    visObj["config"]["color"] = random_hex_color()
    return visObj

def map(visObj):
    visObj["config"]["class"] = "col-md-{width} row-md-{height}".format(width = visObj["config"]["width"], height = visObj["config"]["height"])
    visObj["config"]["color"] = random_hex_color()
    return visObj

def bar(visObj):
    visObj["config"]["class"] = "col-md-{width} row-md-{height}".format(width = visObj["config"]["width"], height = visObj["config"]["height"])
    visObj["config"]["color"] = random_hex_color()
    return visObj

transformations = {"table" : table, "pie" : pie, "map" : map, "bar" : bar}

def get_extra_obj(data):
    extra_obj = []

    return extra_obj

def get_info(data):
    info = {}

    return info