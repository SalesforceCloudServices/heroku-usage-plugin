heroku-usage-plugin
===================

Simple plugin to provide app / addon / dyno heroku usage for users / teams / enterprise accounts

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/heroku-usage-plugin.svg)](https://npmjs.org/package/heroku-usage-plugin)
[![Downloads/week](https://img.shields.io/npm/dw/heroku-usage-plugin.svg)](https://npmjs.org/package/heroku-usage-plugin)
[![License](https://img.shields.io/npm/l/heroku-usage-plugin.svg)](https://github.com/SalesforceCloudServices/heroku-usage-plugin/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g heroku-usage-plugin
$ oclif-example COMMAND
running command...
$ oclif-example (-v|--version|version)
heroku-usage-plugin/0.0.0 darwin-x64 node-v12.16.1
$ oclif-example --help [COMMAND]
USAGE
  $ oclif-example COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`oclif-example usage:across-apps`](#oclif-example-usageacross-apps)
* [`oclif-example usage:app-list`](#oclif-example-usageapp-list)
* [`oclif-example usage:monthly`](#oclif-example-usagemonthly)

## `oclif-example usage:across-apps`

(Demo) Determines dyno and add-on: usage and cost

```
USAGE
  $ oclif-example usage:across-apps

OPTIONS
  -a, --app=app                comma separated list of app names or ids
  -f, --format=human|json|csv  [default: human] format of output
  -t, --team=team              team name or id
  -u, --user=user              account email or id or self

DESCRIPTION
  ...
  Extra documentation goes here everything
```

_See code: [src/commands/usage/across-apps.js](https://github.com/SalesforceCloudServices/heroku-usage-plugin/blob/v0.0.0/src/commands/usage/across-apps.js)_

## `oclif-example usage:app-list`

Determines the list of apps available (by user or team)

```
USAGE
  $ oclif-example usage:app-list

OPTIONS
  -f, --format=human|json|csv  [default: human] format of output
  -s, --silent                 Run silently for use in other methods
  -t, --team=team              team name or id
  -u, --user=user              account email or id or self

DESCRIPTION
  ...
  Extra documentation goes here apps
```

_See code: [src/commands/usage/app-list.js](https://github.com/SalesforceCloudServices/heroku-usage-plugin/blob/v0.0.0/src/commands/usage/app-list.js)_

## `oclif-example usage:monthly`

Describe the command here

```
USAGE
  $ oclif-example usage:monthly

OPTIONS
  -b, --begin=begin            Inclusive Start YYYY-MM to ask from
  -e, --end=end                Inclusive End YYYY-MM to ask until
  -f, --format=human|json|csv  [default: human] format of output
  -t, --team=team              (required) Heroku Team Id

DESCRIPTION
  ...
  Extra documentation goes here
```

_See code: [src/commands/usage/monthly.js](https://github.com/SalesforceCloudServices/heroku-usage-plugin/blob/v0.0.0/src/commands/usage/monthly.js)_
<!-- commandsstop -->
