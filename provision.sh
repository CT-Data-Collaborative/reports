#!/bin/bash
# Provisionning script for PDF Server project

sudo apt-get update
echo "Y" | sudo apt-get upgrade

# APT installs
echo "Y" | sudo apt-get install python-dev python-pip python-lxml libcairo2 libpango1.0-0 libgdk-pixbuf2.0-0 libffi-dev shared-mime-info

# PIP installs
sudo pip install flask weasyprint flask-weasyprint naked

#Node installs
curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get install nodejs
sudo apt-get install npm
sudo npm install --global d3 minimist jsdom@3
