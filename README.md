## PDF Serving Application
#### Installation Instructions
  

1. Install dependancies:    
`sudo apt-get install python-dev python-pip python-lxml libcairo2 libpango1.0-0 libgdk-pixbuf2.0-0 libffi-dev shared-mime-info`  

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

5. Activae virtualenv  
`. venv/bin/activate`  

6. Install pip requirements  
`pip install -r requirements.txt`  

7. Install node from Nodesource PPA  
`curl -sL https://deb.nodesource.com/setup | sudo bash -`  
`sudo apt-get install nodejs build-essential`  

8. Install node requirements  
`npm install`  
