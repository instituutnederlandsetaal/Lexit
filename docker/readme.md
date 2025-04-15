# Lexit docker

## First time deployment
1. Create the following `.env` file:
```sh
DOCKER_VERSION= # docker tag: "dev" or a version from https://github.com/instituutnederlandsetaal/Lexit/releases
CONFIGS_VERSION= # github ref: "origin/development" or a version from https://github.com/instituutnederlandsetaal/Lexit-configs/releases

# used to construct LEXIT_SCHEMA.database
LEXIT_SCHEMA_HOST=
LEXIT_SCHEMA_USER=
LEXIT_SCHEMA_PASSWORD=

# projects retrieved from https://github.com/instituutnederlandsetaal/Lexit-configs by default.
PROJECTS_GIT=https://github.com/instituutnederlandsetaal/Lexit-configs
PROJECTS= # comma-or-newline-or-both separated list of projects. Use a string when using newlines. Use the full path from the repository root, e.g.: "Intern/Cobaltje"
```
2. Run `cp ../lexit2_config_folders/webapps/lexit2_config/projects_overview.js projects_overview.js` and fill it in if desired.
3. Run the docker container: `docker compose up -d`
4. Run `./deploy-projects.sh`. This adds the specified projects to a docker mount of the container

## Updating
### Updating docker container
1. Edit `DOCKER_VERSION` in `.env`
2. Run `docker compose up -d`

### Updating projects
1. Edit `CONFIGS_VERSION` or `PROJECTS` in `.env`
2. Run `./deploy-projects.sh`
