#!/bin/bash
# Provisionning script for PDF Server project
# See README.md for additional instructions on install project specific dependencies.

sudo apt-get update
echo "Y" | sudo apt-get upgrade

# install python dev, pip, and a series of dependancies
echo "Y" | sudo apt-get install g++ libxml2-dev libxslt1-dev zlib1g-dev python-dev python-pip python-lxml libcairo2 libpango1.0-0 libgdk-pixbuf2.0-0 libffi-dev shared-mime-info git

# Get node from latest deb source (0.10.40), comes with npm
curl -sL https://deb.nodesource.com/setup | sudo bash -
echo "Y" | sudo apt-get install nodejs build-essential

