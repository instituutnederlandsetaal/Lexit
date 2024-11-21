# lexit-docker

1. Create the following .env:
```sh
LEXIT_VERSION=latest

# used to construct LEXIT_SCHEMA.database
LEXIT_SCHEMA_HOST=
LEXIT_SCHEMA_USER=
LEXIT_SCHEMA_PASSWORD=

# projects retrieved from github.com/inl/lexit-configs
# use the full path from the repository root. E.g. Intern/Cobaltje
PROJECTS= # comma separated list of projects
```
2. `cp ../lexit2_config_folders/webapps/lexit2_config/projects_overview.js projects_overview.js` and fill it in.
3. Run the lexit docker: `docker compose up -d`
4. Run `./deploy-projects.sh`. This adds the specified projects to a docker mount of the container
