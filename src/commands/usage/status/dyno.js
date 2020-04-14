
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

class DynoStatusCommand extends StatusCommand {
  async run() {
    let results;
    let jsonResults = {};
    const {flags: commandFlags} = this.parse(DynoStatusCommand);
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
    // const localizeNumber = PrintUtil.printNumber.bind(null, useIso);
    // const printPlan = PrintUtil.printHerokuCostPlan;
    const printUnit = PrintUtil.printHerokuCostUnit;
    const printCost = PrintUtil.printHerokuCostPrice.bind(null, useIso);

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

    /*
    results = require('../../../.tmp/psa_data.json');
    */

    results = await this.getStatus(appList, false, true);

    const allDynos = this.getAllDynos(results);

    jsonResults.dynos = allDynos.map((dyno) => ({
      dynoId: dyno.id,
      dynoName: dyno.name,
      appId: dyno.app.id,
      appName: dyno.app.name,
      size: dyno.size,
      state: dyno.state,
      type: dyno.type,
      units: dyno.sizeInfo.dyno_units,
      cost: printCost(dyno.sizeInfo.cost),
      unit: printUnit(dyno.sizeInfo.cost),
      updatedAt: localizeDate(dyno.updated_at),
      createdAt: localizeDate(dyno.created_at)
    }));

    if (format === 'json') {
      cli.log(JSON.stringify(jsonResults, null, 2));
    } else {
      ux.table(jsonResults.dynos, {
        // appId: {header: 'App Name'},
        // dynoId: {header: ''},
        appName: {header: 'App Name'},
        dynoName: {header: 'Dyno Name'},
        size: {header: 'Size'},
        state: {header: 'State'},
        type: {header: 'Type'},
        units: {header: 'Units'},
        cost: {header: 'ListPrice'},
        unit: {header: 'Unit'},
        updatedAt: {header: 'Updated At'},
        createdAt: {header: 'Created At'}
      }, tableFormat);
    }

    // cli.log('success');

    return Promise.resolve(results);
  }
}

DynoStatusCommand.description = `Dynos leveraged for a set of heroku apps.

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
`;

DynoStatusCommand.flags = {
  app: flags.string({char: 'a', description: 'comma separated list of app names or ids'}),
  user: flags.string({char: 'u', description: 'account email or user id'}),
  team: flags.string({char: 't', description: 'team name or id'}),
  format: flags.string({char: 'f', description: 'format of output', default: 'human', options: ['human', 'json', 'csv']})
};

module.exports = DynoStatusCommand;
