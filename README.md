# Persist Vehicles

![](https://img.shields.io/github/downloads/Maximus7474/mps_vehiclepersist/total?logo=github)
![](https://img.shields.io/github/v/release/Maximus7474/mps_vehiclepersist?logo=github) 

![image](https://github.com/user-attachments/assets/2b6c1a71-112a-4e8d-8c48-c1e83054062e)  

A script built for ox core to persist vehicle positions through server reboots.
When the resource stops it'll save all vehicles to the DB, when it gets started it'll respawn all the previously saved files.

### Config
```bash
# Debug Logs
# Refer to https://overextended.dev/ox_core#replicated for details
setr ox:debug 0

# When to save the vehicles
# 0 will only save the vehicles on the txadmin event signalling server shutdown,
# 1 will save the vehicles on resource stop (default option)
set persistvehicles:useTxAdminEvent 1

# Run a version check on resource start
# 0 doesn't run the version check
# 1 runs the version check
set persistvehicles:versioncheck 1
```

### Instalation
1. Run the `base.sql` if not it will not work.

## Getting Started

### Node.js v18+

Install any LTS release of [`Node.js`](https://nodejs.org/) from v18.

### pnpm

Install the [`pnpm`](https://pnpm.io/installation) package manager globally.

```
npm install -g pnpm
```

### Setup

Initialise your own repository by using one of the options below.

- [Create a new repository](https://github.com/new?template_name=fivem-typescript-boilerplate&template_owner=overextended) using this template.
- [Download](https://github.com/overextended/fivem-typescript-boilerplate/archive/refs/heads/main.zip) the template directly.
- Use the [GitHub CLI](https://cli.github.com/).
  - `gh repo create <name> --template=overextended/fivem-typescript-boilerplate`

Navigate to your new directory and execute the following command to install dependencies.

```
pnpm install
```

## Development

Use `pnpm watch` to actively rebuild modified files while developing the resource.

During web development, use `pnpm web:dev` to start vite's webserver and watch for changes.

## Build

Use `pnpm build` to build all project files in production mode.

To build and create GitHub releases, tag your commit (e.g. `v1.0.0`) and push it.

## Layout

- [/dist/](dist)
  - Compiled project files.
- [/locales/](locales)
  - JSON files used for translations with [ox_lib](https://overextended.dev/ox_lib/Modules/Locale/Shared).
- [/scripts/](scripts)
  - Scripts used in the development process, but not part of the compiled resource.
- [/src/](src)
  - Project source code.
- [/static/](static)
  - Files to include with the resource that aren't compiled or loaded (e.g. config).
