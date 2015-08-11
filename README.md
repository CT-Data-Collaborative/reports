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

#### Testing External Calls

The `index.html` in the `external_call_mock/` directory is intended to be run outside of the virtualenv using something like
`python -m SimpleHTTPServer`.

Visiting the resulting page will give you a form in to which you can paste "arbitrary" json data (we need to define and document our arbitrary json structure).

The following examples will produce reports.

`{"template":"town_profile","objects":[{"type":"pie","name":"population","data":[["Q1",26],["Q2",58],["Q3",46],["Q4",32]],"config":{}},{"type":"map","name":"race","data":[],"config":{}},{"type":"table","name":"age","data":[["","0-4","5-9","10-14","15-19","20-24","25-29","30-34","35-44","...","Total"],["Hartford",8487,9184,8613,12832,12571,10721,9165,14801,"...",125130],["Connecticut",197395,220139,236742,255816,229708,217169,211089,469746,"...",3583561]],"config":{}}]}`

`{"template":"town_profile","objects":[{"type":"table","name":"race","data":[["","Hartford","Connecticut"],["Native American",596,8770],["Black",47786,361668],["Hispanic (any race)",54289,496939],["White",43660,2792554]],"config":{}},{"type":"table","name":"population","data":[["","Hartford","Connecticut"],[2015,125999,3644545],[2020,126656,3702469],[2025,126185,3746181]],"config":{}},{"type":"table","name":"age","data":[["","0-4","5-9","10-14","15-19","20-24","25-29","30-34","35-44","...","Total"],["Hartford",8487,9184,8613,12832,12571,10721,9165,14801,"...",125130],["Connecticut",197395,220139,236742,255816,229708,217169,211089,469746,"...",3583561]],"config":{}}]}`

`{"template":"town_profile","objects":[{"type":"pie","name":"race","data":[["Q1",26],["Q2",58],["Q3",46],["Q4",32]],"config":{}},{"type":"table","name":"population","data":[["","Hartford","Connecticut"],[2015,125999,3644545],[2020,126656,3702469],[2025,126185,3746181]],"config":{}},{"type":"table","name":"age","data":[["","0-4","5-9","10-14","15-19","20-24","25-29","30-34","35-44","...","Total"],["Hartford",8487,9184,8613,12832,12571,10721,9165,14801,"...",125130],["Connecticut",197395,220139,236742,255816,229708,217169,211089,469746,"...",3583561]],"config":{}}]}`
