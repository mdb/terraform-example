#!/bin/bash

cd terraform

terraform plan

terraform apply

git checkout master

git add .

NOW=$(TZ=America/New_York date)

git commit -m "tfstate as of $NOW \n\n [ci skip]"

git push origin master
