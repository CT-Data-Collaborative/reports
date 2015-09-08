import json

import random
def random_hex_color():
    r = lambda: random.randint(0,255)
    return('#%02X%02X%02X' % (r(),r(),r()))

CONNECT_HEIGHT = 725

def table(visObj):
    global CONNECT_HEIGHT
    if "width" in visObj["config"] and visObj["config"]["width"] > 0 and visObj["config"]["width"] <= 12:
        del visObj["config"]["width"]
    if "height" in visObj["config"] and visObj["config"]["height"] > 0 and visObj["config"]["height"] <= 12:
        visObj["config"]["height"] = visObj["config"]["height"]*CONNECT_HEIGHT/12.0

    visObj["config"]["color"] = random_hex_color()
    return visObj

def pie(visObj):
    global CONNECT_HEIGHT
    if "width" in visObj["config"] and visObj["config"]["width"] > 0 and visObj["config"]["width"] <= 12:
        del visObj["config"]["width"]
    if "height" in visObj["config"] and visObj["config"]["height"] > 0 and visObj["config"]["height"] <= 12:
        visObj["config"]["height"] = visObj["config"]["height"]*CONNECT_HEIGHT/12.0

    visObj["config"]["color"] = random_hex_color()
    return visObj

def map(visObj):
    global CONNECT_HEIGHT
    if "width" in visObj["config"] and visObj["config"]["width"] > 0 and visObj["config"]["width"] <= 12:
        del visObj["config"]["width"]
    if "height" in visObj["config"] and visObj["config"]["height"] > 0 and visObj["config"]["height"] <= 12:
        visObj["config"]["height"] = visObj["config"]["height"]*CONNECT_HEIGHT/12.0

    visObj["config"]["color"] = random_hex_color()
    return visObj

def bar(visObj):
    global CONNECT_HEIGHT
    if "width" in visObj["config"] and visObj["config"]["width"] > 0 and visObj["config"]["width"] <= 12:
        del visObj["config"]["width"]

    if "height" in visObj["config"] and visObj["config"]["height"] > 0 and visObj["config"]["height"] <= 12:
        visObj["config"]["height"] = visObj["config"]["height"]*CONNECT_HEIGHT/12.0

    if "barHeight" not in visObj["config"]:
        visObj["config"]["barHeight"] = visObj["config"]["height"]/len(visObj["data"])

    visObj["config"]["color"] = random_hex_color()
    return visObj

transformations = {"table" : table, "pie" : pie, "map" : map, "bar" : bar}

def get_extra_obj(data):
    extra_obj = []

    return extra_obj

def get_info(data):
    info = {}

    return info