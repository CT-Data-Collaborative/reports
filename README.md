## PDF Serving Application

#### Installation Instructions
##### Local Deployment
The easiest way to get the report server running is simply to run it locally. To do so, it is as simple as cloning the repository, navigating to the directory, and running `vagrant up`.

##### Other Deployment (the following is a look behind the scenes into what the vagrant up command executes)
Follow the steps below if you are trying to deploy to an existing server (such as an existing production server, etc.). By all accounts, this process is simply the manual way of doing the same things the automated Ansible playbook does, without the one or two steps specific to deploying to vagrant, such as changing file ownership to the vagrant user.

1. Install dependencies - you will need to have permission to do so on your server (ie `sudo` authority). Make sure you have udpated your apt!  
```
sudo apt-get install g++ \
git \
libcairo2 \
libffi-dev \
libgdk-pixbuf2.0-0 \
libpango1.0-0 \
libxml2-dev \
libxslt1-dev \
nginx \
python-dev \
python-lxml \
python-pip \
shared-mime-info \
supervisor \
unzip \
zlib1g-dev
```

2. Navigate to project directory  
   + If you've already got a copy of the repository (ie our usual vagrant M.O.) -  
   `cd path/to/directory`  
   + otherwise -  
   `cd path/to/desired/parent/directory`  
   `git clone https://github.com/CT-Data-Collaborative/reports.git`  
   `cd reports`

3. Install nodejs from Nodesource PPA  
`curl -sL https://deb.nodesource.com/setup | sudo bash -`  
`sudo apt-get install nodejs build-essential`  

4. Install application nodejs requirements  
`npm install`  

5. install Python VirtualEnvironment, you may need `sudo` permissons:  
`pip install virtualenv`  

6. Create virtualenv  
`virtualenv venv`  

7. Activate virtualenv  
`. venv/bin/activate`  

8. Install application python requirements  
`pip install -r requirements.txt`  

9. Install Fonts - this command is a little complicated.  
First navigate to font directory in repository  
`cd /path/to/directory/static/fonts`  
then execute the following  
`ls /path/to/directory/static/fonts/*.zip | xargs -L 1 echo | cut -d "." -f 1 | while read filename; do sudo mkdir /usr/share/fonts/truetype/$filename; done;`  
lastly, update the font cache  
`sudo fc-cache -fv`  
**To explain the large command above:**
   +   the `ls` command lists all the zip files in the font directory
   +   `echo` will pipe the results of the `ls` command into `cut` as strings, not file paths
   +   `cut` will trim the zip file name to just the font title, without the extension.
   +   the last `while; do; done;` will make a new folder in the appropriate place for each font included with the application.  


10. Remove default Nginx site - **N.B.** If you are already running deployed sites with Nginx, you may skip this step.  
`sudo rm /etc/nginx/sites-enabled/defualt`

11. Create Log directory  
`mkdir /path/to/directory/logs`

12. Create supervisor configuration - **N.B.** if you are already using supervisor, you will need to manually update your configuration with whatever is necessary. See the template file included in the repository in `templates/supervisor_program.conf`. Otherwise, it's safe to copy the template into the appropriate directory:  
`sudo cp /path/to/directory/deploy/templates/supervisor_program.conf /etc/supervisor/conf.d/pdf_server.conf`

Now you'll have to fill in the pieces of this configuration. Edit the file you just created at `/etc/supervisor/conf.d/pdf_server.conf` and fill in the following placeholders:  
   +   `{{ user }}` - the username of the unix user that will be running this application
   +   `{{ app_name }}` - the name of the application for `supervisor`'s purposes. usually "pdf_server"
   +   `{{ app_dir }}` - the path to your directory, such as "/var/www/reports"

13. Restart supervisor so it will read the new configuration and start the appropriate process daemon.    
`sudo service supervisor restart`  
If you'd like to make sure the process is running, you can execute:  
`sudo supervisorctl status pdf_server`  
You should see something like:  
`pdf_server            RUNNING         pid 1234, uptime 0:00:01`

14. Create the Nginx site configuration. First copy the template in:  
`sudo cp /path/to/directory/deploy/templates/nginx_site.conf /etc/nginx/sites-available/pdf_server.conf`  
Once again, you'll have to manually fill in the template pieces that would normally be dealt with by Ansible in an automated deployment
   +   `{{ server_name }}` - most likely "localhost", but could FQDN etc as required by your Nginx setup.
   +   `{{ app_dir }}` - the path to your directory, such as "/var/www/reports"

15. Link Nginx configuration from `sites-available` to `sites-enabled`  
`sudo ln /etc/nginx/sites-available/pdf_server.conf /etc/nginx/sites-enabled/pdf_server.conf`

16. Restart Nginx  
`sudo service nginx restart`

The service should now be running. If you'd like to make sure, you can See below on how to test it out, or start sending requests to the appropriate endpoint, such as a POST request to `http://ip-or-fqdn/download` with an appropriate payload.


#### Useful Debugging helpers and tools
+  When developing on a deployed server, git will read the file permission mode changes on every single file in the repository as different, rendering `git status` useless. Instead, use:  
`git -c core.filemode=false status`  
which will run as you expect it to, ignoring file mode changes.
+  If you're connected to the server over SSH while making requests, you can use the debugging code in `pdf_server.py`, lines x-y to get output about each visualization created, or use the `if` clause in line z to filter to just a specific type. When looking for this output, use  
`sudo tail -f /var/www/reports/logs/gunicorn_stdout.log`  
to get a look at the output. This set of debugging tools is very helpful, as errors in the visualization scripts will be invisible otherwise!

#### Unit Testing The Application  
This application has a testing file, using Flask and python UnitTest based functions. To run this test, and any future test that get implemented, simply follow the instructions above for running activating the virtualenv, and execute `python pdf_server_tests.py` to run the testing script.  The output should illustrate if any changes to the current working repository have broken the functionality for the tests involved. When moving to testing, please make sure that there is an appropriate example PDF to match against, as well as the corresponding request JSON. The testing works by calling for a new PDF from the given JSON, and asserting it is as equivalent to the supplied PDF.
  
#### Testing External Calls

The subdirectory `external_call_mock/` is intended to be run outside of the virtualenv using something like  
`python -m SimpleHTTPServer`.

Visiting the resulting page will give you a form in to which you can paste "arbitrary" json data. The structure for this data can be found in the [wiki page for JSON format](https://github.com/CT-Data-Collaborative/reports/wiki/JSON-Format)

For a full town profile mockup, copy the contents of the `static/town_profile_mock.json` file into the external mock form. There is also a version for a CONNECT pdf mockup.

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
