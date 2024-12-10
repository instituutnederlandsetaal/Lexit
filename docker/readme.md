# lexit-docker

## First time deployment
1. Create the following .env:
```sh
LEXIT_VERSION= # a version from https://github.com/INL/Lexit/releases
LEXIT_CONFIGS_VERSION= # a commit hash from https://github.com/INL/Lexit-configs/commits/master/

# used to construct LEXIT_SCHEMA.database
LEXIT_SCHEMA_HOST=
LEXIT_SCHEMA_USER=
LEXIT_SCHEMA_PASSWORD=

# projects retrieved from https://github.com/INL/Lexit-configs
# use the full path from the repository root. E.g. Intern/Cobaltje
PROJECTS= # comma separated list of projects
```
2. `cp ../lexit2_config_folders/webapps/lexit2_config/projects_overview.js projects_overview.js` and fill it in.
3. Run the lexit docker: `docker compose up -d`
4. Run `./deploy-projects.sh`. This adds the specified projects to a docker mount of the container

## Updating
### Updating Lexit
1. Edit `LEXIT_VERSION` in `.env`
2. Run `docker compose pull && docker compose up -d`

### Updating Lexit-configs
1. Edit `LEXIT_CONFIGS_VERSION` in `.env`
2. Run `./deploy-projects.sh`
