#!/bin/bash

# version
echo "=== Lexit Configs Deployer v2025.03.14 ==="

RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
# no color
NC='\033[0m'

# load .env
echo "Loading .env"
set -a && source .env && set +a

# define defaults that can be overridden by .env
PROJECTS_GIT=${PROJECTS_GIT:-"https://github.com/INL/lexit-configs"}

# pull Lexit-configs
echo "Pulling configs from $PROJECTS_GIT"
if [ -d "lexit-configs" ]; then
    git -C lexit-configs fetch
    git -C lexit-configs reset --hard $CONFIGS_VERSION
else
    git clone $PROJECTS_GIT lexit-configs
    git -C lexit-configs reset --hard $CONFIGS_VERSION
fi

# create tmp dirs
TMP_LEXIT_CONFIG=tmp/lexit2_config/
TMP_LEXIT_DB_CONFIG=tmp/lexit2_db_config/
mkdir -p $TMP_LEXIT_CONFIG $TMP_LEXIT_DB_CONFIG

# copy configs
echo "Copying configs to temp folder"
# $PROJECTS is a comma separated list of projects
IFS=$',\n'
for project in $PROJECTS
do
    cp lexit-configs/$project/*.database $TMP_LEXIT_DB_CONFIG 2>/dev/null || echo -e "${YELLOW}WARNING: No database file found for $project. Continuing...${NC}"
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
cp projects_overview.js $TMP_LEXIT_CONFIG 2>/dev/null || echo -e "${YELLOW}WARNING: No projects_overview.js found. Continuing...${NC}"

# rsync from tmp to real
echo "Copying tmp folder to real folder"
rsync -a --delete $TMP_LEXIT_CONFIG lexit2_config/ 2>/dev/null || echo -e "${YELLOW}WARNING: Incomplete rsync of lexit2_config ${NC}"
rsync -a --delete $TMP_LEXIT_DB_CONFIG lexit2_db_config/
rm -rf tmp

echo -e "${GREEN}Finished deploying projects to docker mount!${NC}"
