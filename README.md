## PDF Serving Application

#### Installation Instructions

If you are deploying this application to an existing server or vagrantbox, you will need to ensure that all the required system package dependencies are installed via step 1. If you using the included Vagrantfile to build an isolated vagrant box, the existing provision.sh script will install all the necessary requirements including node (step 7).

1. Install dependencies:    
'sudo apt-get install python-dev python-pip python-lxml libcairo2 libpango1.0-0 libgdk-pixbuf2.0-0 libffi-dev shared-mime-info g++'


2. Navigate to project directory  
   + If you've already got a copy of the repository (ie our usual vagrant M.O.) -  
   `cd path/to/directory`  
   + otherwise -  
   `cd path/to/desired/parent/directory`  
   `git clone https://github.com/CT-Data-Collaborative/reports.git`  
   `cd reports`

3. install Python VirtualEnvironment  
`pip install virtualenv`  

4. Create virtualenv  
`virtualenv venv`  

5. Activate virtualenv  
`. venv/bin/activate`  

6. Install application python requirements  
`pip install -r requirements.txt`  

7. Install nodejs from Nodesource PPA  
`curl -sL https://deb.nodesource.com/setup | sudo bash -`  
`sudo apt-get install nodejs build-essential`  

8. Install application nodejs requirements  
`npm install`  

#### Local Server Configuration Parameters

1. If you are using the vagrant box provisioned by the included script, no additional configuration should be required. Otherwise, you should add a port forward command to your vagrant file the makes the application, which serves on port 9999, available via an available port. 

#### Run Instructions

1. Switch to project directory ('/vagrant' if you are provisioning a distinct vagrant box for the project)

2. Activate virtualenv  
`. venv/bin/activate`  

3. Run flask server
`python pdf_server.py`

#### Testing The Application  
This application has a testing file, using Flask and python UnitTest based functions. To run this test, and any future test that get implemented, simply follow the instructions above for running activating the virtualenv, and execute `python pdf_server_tests.py` to run the testing script.  The output should illustrate if any changes to the current working repository have broken the functionality for the tests involved. Currently, only a file comparison for the Town Profiles is implemented.
  
#### Testing External Calls

The `index.html` in the `external_call_mock/` directory is intended to be run outside of the virtualenv using something like
`python -m SimpleHTTPServer`.

Visiting the resulting page will give you a form in to which you can paste "arbitrary" json data. The structure for this data can be found in the [wiki page for JSON format](https://github.com/CT-Data-Collaborative/reports/wiki/JSON-Format)

For a full town profile mockup, copy the contents of the `static/town_profile_mock.json` file into the external mock form.

The following examples will produce variations of town profile reports, however they are at this point less instructive than generating a full report as mentioned above.

`{"template":"town_profile","config":{},"objects":[{"type":"pie","name":"population","data":[["Q1",26],["Q2",58],["Q3",46],["Q4",32]],"config":{}},{"type":"map","name":"race","data":[],"config":{}},{"type":"table","name":"age","data":[["","0-4","5-9","10-14","15-19","20-24","25-29","30-34","35-44","...","Total"],["Hartford",8487,9184,8613,12832,12571,10721,9165,14801,"...",125130],["Connecticut",197395,220139,236742,255816,229708,217169,211089,469746,"...",3583561]],"config":{}}]}`

`{"template":"town_profile","config":{},"objects":[{"type":"table","name":"race","data":[["","Hartford","Connecticut"],["Native American",596,8770],["Black",47786,361668],["Hispanic (any race)",54289,496939],["White",43660,2792554]],"config":{}},{"type":"table","name":"population","data":[["","Hartford","Connecticut"],[2015,125999,3644545],[2020,126656,3702469],[2025,126185,3746181]],"config":{}},{"type":"table","name":"age","data":[["","0-4","5-9","10-14","15-19","20-24","25-29","30-34","35-44","...","Total"],["Hartford",8487,9184,8613,12832,12571,10721,9165,14801,"...",125130],["Connecticut",197395,220139,236742,255816,229708,217169,211089,469746,"...",3583561]],"config":{}}]}`

`{"template":"town_profile","config":{},"objects":[{"type":"pie","name":"race","data":[["Q1",26],["Q2",58],["Q3",46],["Q4",32]],"config":{}},{"type":"table","name":"population","data":[["","Hartford","Connecticut"],[2015,125999,3644545],[2020,126656,3702469],[2025,126185,3746181]],"config":{}},{"type":"table","name":"age","data":[["","0-4","5-9","10-14","15-19","20-24","25-29","30-34","35-44","...","Total"],["Hartford",8487,9184,8613,12832,12571,10721,9165,14801,"...",125130],["Connecticut",197395,220139,236742,255816,229708,217169,211089,469746,"...",3583561]],"config":{}}]}`

#### Application Directory Structure  
Once installed, the application directory will be layed out as the tree below details. Some structural points of note:
+ `external_request_mock` - This is intended to be run comletely outside of the `pdf_server` application as detailed above.  
+ `node_modules`, `venv` - These will only exist after correct installation of the application and are not included in the repository itself.
+ `scripts` - With the exception of the main application file, this is where all the scripts reside, including intermediary processing and visualization scripts.
+ `static` - 
   + `static/geography` - GeoJSON files will be stored here for use with maps
   + `static/images` - Images used in all reports live here
   + `static/template_config` - report-specific configurations are stored as JSON files in this directory. These are _template level_ configuration parameters and will be applied to every visualization for that request. These configurations are the first level to a kind of override hierarchy. See [the readme on Visualiztion configuration parameters](https://github.com/CT-Data-Collaborative/reports/blob/master/scripts/visualizations/README.md) for more information.
   + `static/tests` - "Standards" (ie a file used as the definitive outcome to compare against) and other required material for running automated tests live here.
+ `old` - Outdated testing scripts have been placed here, most likely removed in the near future.

The completely installed application directory will be structured as follows.  
```
├── external_request_mock
│   ├── index.html
│   └── static
│       └── jquery.fileDownload.js
├── node_modules
│   ├── d3
│   ├── jsdom
│   └── minimist
├── package.json
├── pdf_server.py
├── pdf_server_tests.py
├── provision.sh
├── README.md
├── requirements.txt
├── scripts
│   ├── intermediate
│   │   ├── intermediate_skeleton.py
│   │   └── town_profile.py
│   ├── old
│   │   └── ...
│   └── visualizations
│       ├── bar.js
│       ├── map.js
│       ├── pie.js
│       ├── README.md
│       └── table.js
├── static
│   ├── geography
│   │   └── town_shapes.json
│   ├── images
│   │   └── ... 
│   ├── jquery.fileDownload.js
│   ├── style.css
│   ├── template_config
│   │   ├── config_skeleton.json
│   │   └── town_profile.json
│   └── tests
│       ├── town_profile.pdf
│       └── town_profile_mock.json
├── temp
├── templates
│   ├── bar.html
│   ├── base.html
│   ├── map.html
│   ├── pie.html
│   ├── table.html
│   └── town_profile.html
├── Vagrantfile
└── venv
    ├── bin
    │  ├── activate
    │  └── ...
    └── ...
```
