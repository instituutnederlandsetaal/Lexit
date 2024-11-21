#!/bin/bash

# load .env
echo "Loading .env"
set -a && source .env && set +a

# pull Lexit-configs
echo "Pulling lexit-configs"
if [ -d "lexit-configs" ]; then
    git -C lexit-configs fetch
    LOCAL=$(git -C lexit-configs rev-parse HEAD)
    REMOTE=$(git -C lexit-configs rev-parse @{u})
    if [ "$LOCAL" = "$REMOTE" ]; then
        echo "Already up to date. Exiting."
        exit 0
    fi
    git -C lexit-configs reset --hard
    git -C lexit-configs pull
else
    git clone https://github.com/INL/lexit-configs lexit-configs
fi

# remove any existing configs
echo "Removing existing configs"
rm -rf lexit2_db_config/*
rm -rf lexit2_config/*

# copy configs
echo "Copying configs"
# $PROJECTS is a comma separated list of projects
for project in $(echo $PROJECTS | tr "," "\n")
do
    cp lexit-configs/$project/*.database lexit2_db_config
    cp -r lexit-configs/$project/* lexit2_config
done

# create LEXIT_SCHEMA in-place
echo "Creating LEXIT_SCHEMA"
lexit_schema="lexit2_db_config/LEXIT_SCHEMA.database"
touch $lexit_schema
echo "db=LEXIT_SCHEMA" >> $lexit_schema
echo "schema=public" >> $lexit_schema
echo "host=$LEXIT_SCHEMA_HOST" >> $lexit_schema
echo "user=$LEXIT_SCHEMA_USER" >> $lexit_schema
echo "pass=$LEXIT_SCHEMA_PASSWORD" >> $lexit_schema

echo "Copying projects-overview.js"
cp projects_overview.js lexit2_config

echo "Finished deploying projects to docker mount"