#!/bin/bash
# Provisionning script for PDF Server project

sudo apt-get update
echo "Y" | sudo apt-get upgrade

# install python dev, pip, and a series of dependancies
echo "Y" | sudo apt-get install python-dev python-pip python-lxml libcairo2 libpango1.0-0 libgdk-pixbuf2.0-0 libffi-dev shared-mime-info g++

# PIP install packages
sudo pip install flask weasyprint flask-weasyprint naked

# Get node from latest deb source (0.10.40), comes with npm
curl -sL https://deb.nodesource.com/setup | sudo bash -
echo "Y" | sudo apt-get install nodejs build-essential

# NPM install packages - THIS DOES NOT WORK
sudo npm install --prefix /usr/local d3 minimist jsdom@3
