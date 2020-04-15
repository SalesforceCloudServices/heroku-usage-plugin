
/* eslint-disable no-unused-vars */
const {Command, flags} = require('@heroku-cli/command');
const {CustomColors, color} = require('@heroku-cli/color');
const {ux} = require('cli-ux');
const cli = require('heroku-cli-util');

const path = require('path');
const fs = require('fs-extra');
/* eslint-enable no-unused-vars */

const StatusCommand = require('./'); // eslint-disable-line unicorn/import-index
const AppsCommand = require('../list/apps');
// const ObjectUtil = require('../../../modules/ObjectUtil');
const PrintUtil = require('../../../modules/PrintUtil');

class AppStatusCommand extends StatusCommand {
  async run() {
    let results;
    let jsonResults = {};
    const {flags: commandFlags} = this.parse(AppStatusCommand);
    const appFlag = commandFlags.app || null;
    const user = commandFlags.user || null;
    const team = commandFlags.team || null;
    const format = commandFlags.format || 'human';
    const tableFormat = {
      csv: format === 'csv',
      'no-truncate': format === 'csv'
    };
    const useIso = format !== 'human';
    let appList;

    const localizeDate = PrintUtil.printDate.bind(null, useIso);
    const localizeNumber = PrintUtil.printNumber.bind(null, useIso);
    // const printPlan = PrintUtil.printHerokuCostPlan;
    // const printUnit = PrintUtil.printHerokuCostUnit;
    // const printCost = PrintUtil.printHerokuCostPrice.bind(null, useIso);

    if (appFlag) {
      appList = appFlag.split(/\s*,\s*/);
    } else {
      let args = ['-s'];
      if (team) {
        args = [...args, '-t', team];
      } else if (user) {
        args = [...args, '-u', user];
      }
      appList = await AppsCommand.run(args);
    }

    results = {};
    jsonResults = {};

    results = await this.getStatus(appList, false, false);

    let timestamp = new Date().toISOString();
    const tableTimestamp = {};
    if (format !== 'human') tableTimestamp.timestamp = {header: 'Timestamp'};

    jsonResults.apps = Object.keys(results)
      .map((key) => results[key])
      .map((app) => ({
        timestamp,
        appId: app.appBody.id,
        appName: app.appBody.name,
        region: app.appBody.region ? app.appBody.region.name : '',
        maintenance: app.appBody.maintenance,
        repoSize: localizeNumber(app.appBody.repo_size),
        slugSize: localizeNumber(app.appBody.slug_size),
        space: app.appBody.space ? app.appBody.space.name : '',
        createdAt: localizeDate(app.appBody.created_at),
        updatedAt: localizeDate(app.appBody.updated_at)
      }));

    if (format === 'json') {
      cli.log(JSON.stringify(jsonResults, null, 2));
    } else {
      ux.table(jsonResults.apps, {
        // appId: {header: 'App Id'},
        appName: {header: 'App Name'},
        region: {header: 'Region'},
        maintenance: {header: 'Maintenance'},
        repoSize: {header: 'Repo Size'},
        slugSize: {header: 'Slug Size'},
        space: {header: 'Space'},
        updatedAt: {header: 'Updated At'},
        createdAt: {header: 'Created At'},
        ...tableTimestamp
      }, tableFormat);
    }

    return Promise.resolve(results);
  }
}

AppStatusCommand.description = `Status for a set of heroku apps.

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
`;

AppStatusCommand.flags = {
  app: flags.string({char: 'a', description: 'comma separated list of app names or ids'}),
  user: flags.string({char: 'u', description: 'account email or user id'}),
  team: flags.string({char: 't', description: 'team name or id'}),
  format: flags.string({char: 'f', description: 'format of output', default: 'human', options: ['human', 'json', 'csv']})
};

module.exports = AppStatusCommand;
