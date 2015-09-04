# Intermediary Processing Scripts  
  
These scripts are an intermediate step between receiving a request, and production of the desired visualizations. This step is intended to do 3 important things, and the structure follows that pattern accordingly. When writing an intermediary script for a new report, use the skeleton as a starting point, as it will be updated to maintain the input and return types expected by the serving script.  


### Intermediary Processing of Request Data
One function should be defined for each type of visualization. This step is intended to allow for a custom processing step that reshapes data as necessary from the original request to make it suitable for use in the associated D3 script. These functions are put into an dictionary that is available when the file is read using python's `imp` to import the intermediary file, and is automatically called dynamicall for every request object, by type, as follows in [pdf_server.py:91](https://github.com/CT-Data-Collaborative/reports/blob/master/pdf_server.py#L91)  
  
> `requestObj["data"] = intermediary.transformations[requestObj["type"]](requestObj)`  

The four functions are passed in the entirety of a visualization request object (__not__ the whole report request object!), but only return the corresponding data. These behaviour may be altered in the future to pass and return a consistent type of object, ie to be passed and to return the whole visualization request object.
  

### Add Extra Objects to Request
Certain templates may require visualizations that do not change, or only change very slightly. For example, the CERC Town profile always has a map of Connecticut in the header of the first page, with the town in question filled in and the rest of the map only borders for town boundaries. Such an object may be created in this part of the intermediary script, and returned to extend the original request accordingly before visualizations are processed. See [pdf_server.py:83](https://github.com/CT-Data-Collaborative/reports/blob/master/pdf_server.py#L83).
  
> `req["objects"].extend(intermediary.get_extra_obj(req))`  
  

### Collection of Extra Data and Information
Extra information that may need lookups, or other sourcing methodology, can be attained here and added to an object called `info` in the serving script. This info is in turn passed to the template for use in rendering the final output.  
  
See [pdf_server.py:70](https://github.com/CT-Data-Collaborative/reports/blob/master/pdf_server.py#L70).
> `info = intermediary.get_info(req)`  

and [pdf_server.py:126](https://github.com/CT-Data-Collaborative/reports/blob/master/pdf_server.py#L70).
> `response = render_template(template+".html", config = templateConfig, info = info, objects = objects)`  
