#!/bin/bash

# load .env
echo "Loading .env"
set -a && source .env && set +a

# pull Lexit-configs
echo "Pulling lexit-configs"
if [ -d "lexit-configs" ]; then
    git -C lexit-configs fetch
    git -C lexit-configs reset --hard $LEXIT_CONFIGS_VERSION
else
    git clone https://github.com/INL/lexit-configs lexit-configs
    git -C lexit-configs reset --hard $LEXIT_CONFIGS_VERSION
fi

# create tmp dirs
TMP_LEXIT_CONFIG=tmp/lexit2_config/
TMP_LEXIT_DB_CONFIG=tmp/lexit2_db_config/
mkdir -p $TMP_LEXIT_CONFIG $TMP_LEXIT_DB_CONFIG

# copy configs
echo "Copying configs to temp folder"
# $PROJECTS is a comma separated list of projects
for project in $(echo $PROJECTS | tr "," "\n")
do
    cp lexit-configs/$project/*.database $TMP_LEXIT_DB_CONFIG
    cp -r lexit-configs/$project/* $TMP_LEXIT_CONFIG
done

# remove all .database files from the temporary lexit2_config
find $TMP_LEXIT_CONFIG -type f -name "*.database" -delete

# create LEXIT_SCHEMA in-place
echo "Creating LEXIT_SCHEMA"
lexit_schema="$TMP_LEXIT_DB_CONFIG/LEXIT_SCHEMA.database"
touch $lexit_schema
echo "db=LEXIT_SCHEMA" >> $lexit_schema
echo "schema=public" >> $lexit_schema
echo "host=$LEXIT_SCHEMA_HOST" >> $lexit_schema
echo "user=$LEXIT_SCHEMA_USER" >> $lexit_schema
echo "pass=$LEXIT_SCHEMA_PASSWORD" >> $lexit_schema

echo "Copying projects-overview.js"
cp projects_overview.js $TMP_LEXIT_CONFIG

# rsync from tmp to real
echo "Copying tmp folder to real folder"
rsync -a --delete $TMP_LEXIT_CONFIG lexit2_config/
rsync -a --delete $TMP_LEXIT_DB_CONFIG lexit2_db_config/
rm -rf tmp

echo "Finished deploying projects to docker mount"
