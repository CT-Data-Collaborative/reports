import json

def table(visObj):
    return visObj

def pie(visObj):
    return visObj

def map(visObj):
    visObj["data"] = visObj["data"]["records"]

    return visObj

def bar(visObj):
    return visObj

def groupedbar(visObj):
    return visObj

def stackedbar(visObj):
    return visObj

transformations = {"table" : table, "pie" : pie, "map" : map, "bar" : bar, "groupedbar" : groupedbar, "stackedbar" : stackedbar}

def get_extra_obj(data):
    extra_obj = []

    return extra_obj

def get_info(data):
    info = {}

    return info