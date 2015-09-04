import json

def table(visObj):
    return visObj["data"]

def bar(visObj):
    return visObj["data"]

def pie(visObj):
    return visObj["data"]

def map(visObj):
    return visObj["data"]

transformations = {"table" : table, "pie" : pie, "map" : map, "bar" : bar}

def get_extra_obj(data):
    extra_obj = []

    return extra_obj

def get_info(data):
    info = {}

    return info