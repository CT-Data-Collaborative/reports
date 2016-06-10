## PDF Serving Application

#### Installation Instructions
##### Local Deployment
The easiest way to get the report server running is simply to run it locally. To do so, it is as simple as cloning the repository, navigating to the directory, and running `vagrant up`.

##### Other Deployment
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
If you deployed this locally using vagrant, the application will already be running as a `gunicorn` service in `supervisor`. Otherwise:

1. Switch to project directory ('/vagrant' if you are provisioning a distinct vagrant box for the project)

2. Activate virtualenv  
`. venv/bin/activate`  

3. Run flask server
`python pdf_server.py`

#### Useful Debugging helpers and tools
+  When developing on a deployed server, git will read the file permission mode changes on every single file in the repository as different, rendering `git status` useless. Instead, use `git -c core.filemode=false status`, which will run as you expect it to, ignoring file mode changes.
+  If you're connected to the server over SSH while making requests, you can use the debugging code in `pdf_server.py`, lines x-y to get output about each visualization created, or use the `if` clause in line z to filter to just a specific type. When looking for this output, use `sudo tail -f /var/www/reports/logs/gunicorn_stdout.log` to get a look at the output. This set of debugging tools is very helpful, as errors in the visualization scripts will be invisible otherwise!

#### Testing The Application  
This application has a testing file, using Flask and python UnitTest based functions. To run this test, and any future test that get implemented, simply follow the instructions above for running activating the virtualenv, and execute `python pdf_server_tests.py` to run the testing script.  The output should illustrate if any changes to the current working repository have broken the functionality for the tests involved. When moving to testing, please make sure that there is an appropriate example PDF to match against, as well as the corresponding request JSON. The testing works by calling for a new PDF from the given JSON, and asserting it is as equivalent to the supplied PDF.
  
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
Once installed, the application directory will be laid out as the tree below details. Some structural points of note:
+ `deploy` - contains scripts and configuration files used in the automated (vagrant) deployment.
+ `external_request_mock` - This is intended to be run completely outside of the `pdf_server` application as detailed above.  
+ `node_modules`, `venv` - These will only exist after correct installation of the application and are not included in the repository itself.
+ `scripts` - With the exception of the main application file, this is where all the scripts reside, including intermediary processing and visualization scripts.
+ `templates` - This folder contains the Jinja2 templates used to first render each visualization individually, and finally the report templates that have these visualizations put into them.
+ `static` - 
   + `static/geography` - GeoJSON files will be stored here for use with maps
   + `static/images` - Images used in all reports live here
   + `static/fonts` - contains any fonts used and deployed with this server.
   + `static/template_config` - report-specific configurations are stored as JSON files in this directory. These are _template level_ configuration parameters and will be applied to every visualization for that request. These configurations are the first level to a kind of override hierarchy. See [the readme on Visualiztion configuration parameters](https://github.com/CT-Data-Collaborative/reports/blob/master/scripts/visualizations/README.md) for more information.
   + `static/tests` - "Standards" (ie a file used as the definitive outcome to compare against) and other required material for running automated tests live here.
   + `static/jquery.fileDownload.js` - this is used in the external request mock page to trigger an automatic download of a produced pdf from the supplied "arbitrary" request.

The completely installed application directory will be structured as follows.  
```
├── external_request_mock
│   ├── index.html
│   ├── view.html
│   └── static
│       └── jquery.fileDownload.js
├── node_modules
│   ├── d3
│   ├── d3-jetpack
│   ├── jsdom
│   └── minimist
│   └── simple-statistics
├── package.json
├── pdf_server.py
├── pdf_server.ini
├── pdf_server_tests.py
├── provision.sh
├── README.md
├── requirements.txt
├── scripts
│   ├── intermediate
│   │   ├── intermediate_skeleton.py
│   │   └── test.md
│   │   └── town_profile.py
│   │   └── connect.py
│   │   └── README.md
│   └── old
│   └── visualizations
│       ├── bar.js
│       ├── groupedbar.js
│       ├── stackedbar.js
│       ├── map.js
│       ├── pie.js
│       ├── README.md
│       └── table.js
│       └── simpletable.js
├── static
│   ├── fonts
│   │   └── ...
│   ├── geography
│   │   └── town_shapes.json
│   ├── images
│   │   └── ... 
│   ├── jquery.fileDownload.js
│   ├── styles
│   │   ├── bootstrap
│   │   │   └── . . .
│   │   ├── base.css
│   │   ├── town_profile.css
│   │   └── connect.css
│   ├── template_config
│   │   ├── config_skeleton.json
│   │   └── town_profile.json
│   └── tests
│       ├── connect.pdf
│       ├── connect_mock.json
│       ├── town_profile.pdf
│       └── town_profile_mock.json
├── temp
├── templates
│   ├── base.html
│   ├── bar.html
│   ├── groupedbar.html
│   ├── stackedbar.html
│   ├── map.html
│   ├── pie.html
│   ├── table.html
│   ├── simpletable.html
│   ├── test.html
│   ├── town_profile.html
│   └── connect.html
├── Vagrantfile
├── wsgi.py
└── venv
    ├── bin
    │  ├── activate
    │  └── ...
    └── ...
```
