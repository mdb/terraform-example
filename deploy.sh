#!/bin/bash

cd terraform

terraform plan

terraform apply

echo "Setting git user name"
git config user.name "TravisCI"

echo "Setting git user email"
git config user.email "mikedball@gmail.com"

echo "Adding git upstream remote"
git remote add upstream "https://$GH_TOKEN@github.com/mdb/terraform-example.git"

git checkout master

git add .

NOW=$(TZ=America/New_York date)

git commit -m "tfstate as of $NOW \n\n [ci skip]"

echo "Pushing changes to upstream master"
git push upstream master
