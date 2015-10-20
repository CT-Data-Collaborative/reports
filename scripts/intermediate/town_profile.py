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
                    "FIPS" : {"value" : "0900337070", "type" : "integer"}
                }
            ]
        },
        "config": {
            "margin": 10,
            "width" : 275,
            "height" : 150
        }
    }
    extra_obj.append(header_map)
    

    return extra_obj

def get_info(data):
    info = {}

    # This info should be sourced according to the data object, probably based on FIPS or town name
    info["address"] = ["Town Hall", "550 Main Street", "Hartford, CT 06103", "(860) 543-8500"]
    info["belongs_to"] = ["Hartford County", "LMA Hartford", "Capitol Area Economic Dev. Region", "Capitol Region Planning Area"]
    info["incorporated"] = 1784

    info["enrollment_info"] = {"district" : "Hartford School District", "enrollment" : 20390}

    info["government_form"] = "Council-Manager"

    return info