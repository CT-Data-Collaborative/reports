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
