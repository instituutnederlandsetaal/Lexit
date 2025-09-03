# Lexit docker

## First time deployment
1. Create the following `.env` file:
```sh
# docker tag: "dev" or a version from https://github.com/instituutnederlandsetaal/Lexit/releases
DOCKER_VERSION=
# github ref: "origin/development" or a version from https://github.com/instituutnederlandsetaal/Lexit-configs/releases
CONFIGS_VERSION=

# used to construct LEXIT_SCHEMA.database
LEXIT_SCHEMA_HOST=
LEXIT_SCHEMA_USER=
LEXIT_SCHEMA_PASSWORD=

# projects retrieved from https://github.com/instituutnederlandsetaal/Lexit-configs by default
PROJECTS_GIT=https://github.com/instituutnederlandsetaal/Lexit-configs
# comma-or-newline-or-both separated projects list. Use a string when using newlines.
# Use the full path from the repository root, e.g.: "Intern/Cobaltje"
PROJECTS=
```
2. Run the docker container: `docker compose up -d`
3. Run `./deploy-projects.sh`. This adds the specified projects to a docker mount of the container

## Updating
### Updating docker container
1. Edit `DOCKER_VERSION` in `.env`
2. Run `docker compose up -d`

### Updating projects
1. Edit `CONFIGS_VERSION` or `PROJECTS` in `.env`
2. Run `./deploy-projects.sh`
