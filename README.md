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

Install through `heroku plugins:install heroku-usage-plugin`

<!-- usage -->
```sh-session
$ npm install -g heroku-usage-plugin
$ heroku COMMAND
running command...
$ heroku (-v|--version|version)
heroku-usage-plugin/1.3.0 darwin-x64 node-v12.16.1
$ heroku --help [COMMAND]
USAGE
  $ heroku COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`heroku usage:daily`](#heroku-usagedaily)
* [`heroku usage:list:apps`](#heroku-usagelistapps)
* [`heroku usage:monthly`](#heroku-usagemonthly)
* [`heroku usage:status`](#heroku-usagestatus)
* [`heroku usage:status:addon`](#heroku-usagestatusaddon)
* [`heroku usage:status:app`](#heroku-usagestatusapp)
* [`heroku usage:status:attachment`](#heroku-usagestatusattachment)
* [`heroku usage:status:dyno`](#heroku-usagestatusdyno)

## `heroku usage:daily`

Usage for an Enterprise Account / Team at a Daily resolution.

```
USAGE
  $ heroku usage:daily

OPTIONS
  -a, --account=account        Enterprise Account Id
  -b, --begin=begin            Inclusive Start YYYY-MM-DD to ask from
  -e, --end=end                Inclusive End YYYY-MM-DD to ask until
  -f, --format=human|json|csv  [default: human] format of output
  -t, --team=team              Heroku Team Id

DESCRIPTION
  Team: Name of the Enterprise Account / Team
  App: Application Name
  Date: Date of the usage
  Addons: Total add-on credits used
  Dynos: Dyno credits used
  Data: Add-On credits used for first party add-ons
  Partner: Add-On credits used for third party add-ons
  Space: Private Space credits used

  https://devcenter.heroku.com/articles/platform-api-reference#enterprise-account-daily-usage
```

_See code: [src/commands/usage/daily.js](https://github.com/SalesforceCloudServices/heroku-usage-plugin/blob/v1.3.0/src/commands/usage/daily.js)_

## `heroku usage:list:apps`

Determines the list of apps available: by user or team.

```
USAGE
  $ heroku usage:list:apps

OPTIONS
  -f, --format=human|json|csv  [default: human] format of output
  -t, --team=team              team name or id
  -u, --user=user              account email or id or self

DESCRIPTION
  (If no user or term is specified, then the apps available to the current user is provided)
```

_See code: [src/commands/usage/list/apps.js](https://github.com/SalesforceCloudServices/heroku-usage-plugin/blob/v1.3.0/src/commands/usage/list/apps.js)_

## `heroku usage:monthly`

Usage for an Enterprise Account / Team at a Monthly resolution.

```
USAGE
  $ heroku usage:monthly

OPTIONS
  -a, --account=account        Enterprise Account Id
  -b, --begin=begin            Inclusive Start YYYY-MM to ask from
  -e, --end=end                Inclusive End YYYY-MM to ask until
  -f, --format=human|json|csv  [default: human] format of output
  -t, --team=team              (required) Heroku Team Id

DESCRIPTION
  Team: Name of the Enterprise Account / Team
  App: Application Name
  Date: Date of the usage
  Addons: Total add-on credits used
  Connect: Heroku Connect rows managed
  Dynos: Dyno credits used
  Data: Add-On credits used for first party add-ons
  Partner: Add-On credits used for third party add-ons
  Space: Private Space credits used

  For more information, please see: 
  https://devcenter.heroku.com/articles/platform-api-reference#enterprise-account-monthly-usage
```

_See code: [src/commands/usage/monthly.js](https://github.com/SalesforceCloudServices/heroku-usage-plugin/blob/v1.3.0/src/commands/usage/monthly.js)_

## `heroku usage:status`

Current add-on / attachment / dyno / app status.

```
USAGE
  $ heroku usage:status

OPTIONS
  -a, --app=app                comma separated list of app names or ids
  -f, --format=human|json|csv  [default: human] format of output
  -t, --team=team              team name or id
  -u, --user=user              account email or user id

DESCRIPTION
  (Please note that if neither a team or user is specified, all apps for the current user are determined)

  This includes the add-ons status, attachment status, dynos status, and app status commands.

  Please see those commands for more detail.
```

_See code: [src/commands/usage/status/index.js](https://github.com/SalesforceCloudServices/heroku-usage-plugin/blob/v1.3.0/src/commands/usage/status/index.js)_

## `heroku usage:status:addon`

Add-Ons leveraged for a set of Heroku Apps.

```
USAGE
  $ heroku usage:status:addon

OPTIONS
  -a, --app=app                comma separated list of app names or ids
  -f, --format=human|json|csv  [default: human] format of output
  -t, --team=team              team name or id
  -u, --user=user              account email or user id

DESCRIPTION
  The number of Attached Add-Ons are currently limited to the Applications retrieved.
  To get a truly representative list of Apps using the Add-Ons,
  it is recommended that a wider net of Applications be requested.

  The full list of applications that leverage the attachment is the
  'attachmentApplications' list provided within --format JSON.

  (Please note that if neither a team or user is specified, all apps for the current user are considered)

  The ListPrice of the Add-On is likely not the price being paid.
  However, this price can often directionally which Add-Ons are more expensive than others.

  App Name: Name of the Heroku Application
  Add-On Name: Specific name for this add-on
  Service: Name of the Add-On Service
  Attachments: # of apps this Add-On is attached to
  Plan: Name of the Plan this Add-On is using.
  ListPrice: List Price this Add-On would normally cost.
  Unit: The frequency that the Add-On cost would occur (ex: monthly)
  Updated At: Date/Time the Application was last updated
  Created At: Date/Time the Application was created

  For more information, please see:
  https://devcenter.heroku.com/articles/platform-api-reference#add-on
```

_See code: [src/commands/usage/status/addon.js](https://github.com/SalesforceCloudServices/heroku-usage-plugin/blob/v1.3.0/src/commands/usage/status/addon.js)_

## `heroku usage:status:app`

Status for a set of heroku apps.

```
USAGE
  $ heroku usage:status:app

OPTIONS
  -a, --app=app                comma separated list of app names or ids
  -f, --format=human|json|csv  [default: human] format of output
  -t, --team=team              team name or id
  -u, --user=user              account email or user id

DESCRIPTION
  (Please note that if neither a team or user is specified, all apps for the current user are considered)

  App Name: Name of the Heroku Application
  Region: Region of the Heroku Application
  Maintenance: Whether the app is under maintenance mode (true) or not (false)
  Repo Size: Size of the repository for the Application
  Slug Size: Size of the Slug used for the Application
  Space: Name of the Private Space used
  Updated At: Date/Time the Application was last updated
  Created At: Date/Time the Application was created

  For more information, please see:
  https://devcenter.heroku.com/articles/platform-api-reference#app
```

_See code: [src/commands/usage/status/app.js](https://github.com/SalesforceCloudServices/heroku-usage-plugin/blob/v1.3.0/src/commands/usage/status/app.js)_

## `heroku usage:status:attachment`

List of Add-Ons at the attachment level.

```
USAGE
  $ heroku usage:status:attachment

OPTIONS
  -a, --app=app                comma separated list of app names or ids
  -f, --format=human|json|csv  [default: human] format of output
  -t, --team=team              team name or id
  -u, --user=user              account email or user id

DESCRIPTION
  (Please note that if neither a team or user is specified, all apps for the current user are considered)

  Attachment Name: Unique name for this add-on attachment to this app
  Add-On Name: Globally unique name of the Add-On
  Relationship: whether the attachment is owned by a different app (attached) or directly by the app (direct)
  Owning App: Name of the singular app that owns the Add-On
  Attached App: Name of the app that this add-on is attached to
  Created At: the date the attachment was created
  Updated At: the date the attachment was updated

  For more information, please see:
  https://devcenter.heroku.com/articles/platform-api-reference#add-on-attachment
```

_See code: [src/commands/usage/status/attachment.js](https://github.com/SalesforceCloudServices/heroku-usage-plugin/blob/v1.3.0/src/commands/usage/status/attachment.js)_

## `heroku usage:status:dyno`

Dynos leveraged for a set of heroku apps.

```
USAGE
  $ heroku usage:status:dyno

OPTIONS
  -a, --app=app                comma separated list of app names or ids
  -f, --format=human|json|csv  [default: human] format of output
  -t, --team=team              team name or id
  -u, --user=user              account email or user id

DESCRIPTION
  (Please note that if neither a team or user is specified, all apps for the current user are considered)

  The ListPrice of the Dyno is likely not the price being paid.
  However, this price can often directionally which Dynos are more expensive than others.

  App Name: Name of the Heroku Application
  Dyno Name: Name of the process on this dyno
  Size: Dyno Size (ex: 'standard-1X')
  State: Current status of the process (ex: crashed, up, down, etc.)
  Type: Type of process
  Units: Number of units incurred for this Dyno Size type
  ListPrice: List Price this Dyno would normally cost.
  Unit: The frequency that the Dyno cost would occur (ex: monthly)
  Updated At: Date/Time the Application was last updated
  Created At: Date/Time the Application was created

  For more information, please see:
  https://devcenter.heroku.com/articles/platform-api-reference#dyno
```

_See code: [src/commands/usage/status/dyno.js](https://github.com/SalesforceCloudServices/heroku-usage-plugin/blob/v1.3.0/src/commands/usage/status/dyno.js)_
<!-- commandsstop -->
