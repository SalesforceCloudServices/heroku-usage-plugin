
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

class AddonStatusCommand extends StatusCommand {
  async run() {
    let results;
    let jsonResults = {};
    const {flags: commandFlags} = this.parse(AddonStatusCommand);
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
    const printPlan = PrintUtil.printHerokuCostPlan;
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

    results = await this.getStatus(appList, true, false);

    const allAddons = this.getAllAddons(results);

    jsonResults.addons = allAddons.map((addon) => ({
      appId: addon.app.id,
      appName: addon.app.name,
      name: addon.name,
      service: addon.addon_service.name,
      addonId: addon.id,
      attachments: localizeNumber(addon.addonAttachments.length),
      attachmentApplications: addon.addonAttachments,
      planName: printPlan(addon.plan.name),
      cost: printCost(addon.billed_price),
      unit: printUnit(addon.billed_price),
      state: addon.state,
      updatedAt: localizeDate(addon.updated_at),
      createdAt: localizeDate(addon.created_at)
    }));

    if (format === 'json') {
      cli.log(JSON.stringify(jsonResults, null, 2));
    } else {
      ux.table(jsonResults.addons, {
        // addonId: {header: 'Add-On Id'},
        // appId: {header: 'App Id'},
        appName: {header: 'App Name'},
        // name: {header: 'Add-On Name'},
        service: {header: 'Service'},
        attachments: {header: '# Attachments'},
        planName: {header: 'Plan'},
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

AddonStatusCommand.description = `Add-Ons leveraged for a set of Heroku Apps.

The number of Attached Add-Ons are currently limited to the Applications retrieved.
To get a truly representative list of Apps using the Add-Ons,
it is recommended that a wider net of Applications be requested.

The full list of applications that leverage the attachment is the
'attachmentApplications' list provided within --format JSON.

(Please note that if neither a team or user is specified, all apps for the current user are considered)

The ListPrice of the Add-On is likely not the price being paid.
However, this price can often directionally which Add-Ons are more expensive than others.

App Name: Name of the Heroku Application
Service: Name of the Add-On Service
Attachments: # of apps this Add-On is attached to
Plan: Name of the Plan this Add-On is using.
ListPrice: List Price this Add-On would normally cost.
Unit: The frequency that the Add-On cost would occur (ex: monthly)
Updated At: Date/Time the Application was last updated
Created At: Date/Time the Application was created

For more information, please see:
https://devcenter.heroku.com/articles/platform-api-reference#add-on
`;

AddonStatusCommand.flags = {
  app: flags.string({char: 'a', description: 'comma separated list of app names or ids'}),
  user: flags.string({char: 'u', description: 'account email or user id'}),
  team: flags.string({char: 't', description: 'team name or id'}),
  format: flags.string({char: 'f', description: 'format of output', default: 'human', options: ['human', 'json', 'csv']})
};

module.exports = AddonStatusCommand;
