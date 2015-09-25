import os
import json

CONNECT_HEIGHT = 700
CONNECT_WIDTH = 640

def table(visObj):
    global CONNECT_HEIGHT
    if "width" in visObj["config"] and visObj["config"]["width"] > 0 and visObj["config"]["width"] <= 12:
        visObj["config"]["width"] = visObj["config"]["width"]*CONNECT_WIDTH/12.0
    if "height" in visObj["config"] and visObj["config"]["height"] > 0 and visObj["config"]["height"] <= 12:
        visObj["config"]["height"] = visObj["config"]["height"]*CONNECT_HEIGHT/12.0

    # visObj["data"] = visObj["data"]["records"]

    # print("++ TABLE ++")
    # print("Height: " + str(visObj["config"]["height"]))
    # print("Width: " + str(visObj["config"]["width"]))

    return visObj

def pie(visObj):
    global CONNECT_HEIGHT
    if "width" in visObj["config"] and visObj["config"]["width"] > 0 and visObj["config"]["width"] <= 12:
        visObj["config"]["width"] = visObj["config"]["width"]*CONNECT_WIDTH/12.0
    if "height" in visObj["config"] and visObj["config"]["height"] > 0 and visObj["config"]["height"] <= 12:
        visObj["config"]["height"] = visObj["config"]["height"]*CONNECT_HEIGHT/12.0

    if len(visObj["data"]["records"][0]) > 2:
        # trim fields
        visObj["data"]["fields"] = visObj["data"]["fields"][0:2]
        # get field names, these are the keys in the records that we will keep, and remove all other keys
        toKeep = [field["id"] for field in visObj["data"]["fields"]]
        # iterate through records, modifying data in place, only keeping first two values
        for i in range(0, len(visObj["data"]["records"])):
            visObj["data"]["records"][i] = {key : visObj["data"]["records"][i][key] for key in toKeep}


    
    visObj["data"] = visObj["data"]["records"]

    # print("++ PIE ++")
    # print("Height: " + str(visObj["config"]["height"]))
    # print("Width: " + str(visObj["config"]["width"]))

    return visObj

def map(visObj):
    global CONNECT_HEIGHT
    if "width" in visObj["config"] and visObj["config"]["width"] > 0 and visObj["config"]["width"] <= 12:
        visObj["config"]["width"] = visObj["config"]["width"]*CONNECT_WIDTH/12.0
    if "height" in visObj["config"] and visObj["config"]["height"] > 0 and visObj["config"]["height"] <= 12:
        visObj["config"]["height"] = visObj["config"]["height"]*CONNECT_HEIGHT/12.0

    visObj["data"] = visObj["data"]["records"]

    # print("++ MAP ++")
    # print("Height: " + str(visObj["config"]["height"]))
    # print("Width: " + str(visObj["config"]["width"]))

    return visObj

def bar(visObj):
    global CONNECT_HEIGHT
    if "width" in visObj["config"] and visObj["config"]["width"] > 0 and visObj["config"]["width"] <= 12:
        visObj["config"]["width"] = visObj["config"]["width"]*CONNECT_WIDTH/12.0

    if "height" in visObj["config"] and visObj["config"]["height"] > 0 and visObj["config"]["height"] <= 12:
        visObj["config"]["height"] = visObj["config"]["height"]*CONNECT_HEIGHT/12.0

    if "barHeight" not in visObj["config"]:
        visObj["config"]["barHeight"] = visObj["config"]["height"]/len(visObj["data"])

    visObj["data"] = visObj["data"]["records"]

    # print("++ BAR ++")
    # print("Height: " + str(visObj["config"]["height"]))
    # print("Width: " + str(visObj["config"]["width"]))

    return visObj

transformations = {"table" : table, "pie" : pie, "map" : map, "bar" : bar}

def get_extra_obj(data):
    extra_obj = []

    # region map and town list
    if "config" in data and "region" in data["config"]:
        region_map = {
            "name" : "region_map",
            "type" : "map",
            "data" : {
                "fields" : [],
                "records" : []
                },
            "config" : {
                "legend" : False,
                "height": 2,
                "width" : 4,
                "margin": {"top" : 30, "right" : 0, "bottom" : 0, "left" : 0}
                }
            }
        region_map["data"]["fields"] = [{"type" : "string", "id" : "FIPS"}, {"type" : "integer", "id" : "Value"}]
        
        town_list = {"name" : "town_list", "type" : "table", "data" : {"fields" : [], "records" : []}, "config" : {"height" : 2, "width" : 9}}
        town_list["data"]["fields"] = [{"type" : "string", "id" : "Town"}]
        # go through geojson and take values that are in the right region (for testing, i'm using county)
        # at the same time, build list of towns by name
        map_data = []
        town_data = []
        
        with open("/vagrant/static/geography/town_shapes.json") as geoJSON_file:
            geoJSON = json.load(geoJSON_file)

            for feature in geoJSON["features"]:
                if feature["properties"]["COUNTYFP10"] == data["config"]["region"]:
                    map_object = {"FIPS" : {}, "Value" : {}}
                    map_object["FIPS"] = {"type" : "string", "value" : feature["properties"]["GEOID10"]}
                    map_object["Value"] = {"type" : "integer", "value" : 1}
                    map_data.append(map_object)

                    town_object = {"Town" : {}}
                    town_object["Town"] = {"type" : "string", "value" : feature["properties"]["NAME10"]}
                    town_data.append(town_object)

        region_map["data"]["records"] = map_data
        town_list["data"]["records"] = town_data

        extra_obj.append(region_map)
        extra_obj.append(town_list)

    return extra_obj

def get_info(data):
    info = {}

    info["month"] = "September"
    info["year"] = "2015"

    return info