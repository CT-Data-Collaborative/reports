import json

def table(visObj):
    visObj["data"] = visObj["data"]["records"]
    return visObj

def simpletable(visObj):
    visObj["data"] = visObj["data"]["records"]
    return visObj

def pie(visObj):
    visObj["data"] = visObj["data"]["records"]
    return visObj

def map(visObj):
    visObj["data"] = visObj["data"]["records"]
    return visObj

def bar(visObj):
    visObj["data"] = visObj["data"]["records"]
    return visObj

transformations = {"table" : table, "simpletable" : simpletable, "pie" : pie, "map" : map, "bar" : bar}

def get_extra_obj(data):
    extra_obj = []

    header_map = {
        "type": "map",
        "name": "header_map",
        "data": {
            "fields" : [
                {"id" : "FIPS", "type" : "integer"},
                {"id" : "Statistic", "type" : "integer"}
            ],
            "records" : [
                {
                    "Statistic" : {"value" : 1, "type" : "integer"},
                    "FIPS" : {"value" : obj.config.FIPS, "type" : "integer"}
                }
            ]
        },
        "config": {
            "legend" : False,
            "margin": {
                "top": 10,
                "right": 10,
                "bottom": 10,
                "left": 10
            },
            "colors" : ["#000000"],
            "width" : 275,
            "height" : 150
        }
    }
    extra_obj.append(header_map)
    

    return extra_obj

def get_info(data):
    info = {}

    info["address"] = data.config.info["address"]
    info["belongs_to"] = data.config.info["municipalorgs"]
    info["incorporated"] = data.config.info["incorporation"]

    info["enrollment_info"] = data.config.info["enrollmentcallout"]

    info["government_form"] = data.config.info["governmentform"]

    return info