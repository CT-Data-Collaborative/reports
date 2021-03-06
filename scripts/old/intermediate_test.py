import json

def transform_data(visObj, type = None):
    if type == "table":
        if ("header" not in visObj["config"] or visObj["config"]["header"] == True):
            columns = visObj["data"].pop(0)
            rows = visObj["data"]
            return {"columns" : columns, "rows" : rows}
        else:
            return {"columns" : [], "rows" : visObj["data"]}

def get_extra_obj(data):
    extra_obj = []

    header_map = {
      "type": "map",
      "name": "header_map",
      "data": [
        [
          {
            "value": "FIPS",
            "type": "string"
          },
          {
            "value": "Statistic",
            "type": "string"
          }
        ],
        [
          {
            "value": "0900337070",
            "type": "FIPS"
          },
          {
            "value": 1,
            "type": "decimal"
          }
        ]
      ],
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