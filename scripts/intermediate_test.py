import json

def transform_data(data, type = None):
    if type == "table":
        columns = data.pop(0)
        rows = data
        return {"columns" : columns, "rows" : rows}
