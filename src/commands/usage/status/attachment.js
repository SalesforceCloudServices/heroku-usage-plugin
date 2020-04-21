
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
    const cache = commandFlags.cache || false;

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

    results = await this.getStatus(appList, true, false, cache);

    let timestamp = new Date().toISOString();
    const tableTimestamp = {};
    if (format !== 'human') tableTimestamp.timestamp = {header: 'Timestamp'};

    jsonResults.attachments = Object.keys(results)
      .map((key) => results[key])
      .reduce((attachmentsResults, appInfo) => [
        ...attachmentsResults,
        ...appInfo.attachmentsBody.map((attachment) => ({
          timestamp,
          attachmentId: attachment.id,
          attachmentName: attachment.name,
          addonId: attachment.addon.id,
          addonName: attachment.addon.name,
          webURL: attachment.web_url,
          logInputURL: attachment.log_input_url,
          namespace: attachment.namespace,
          attachedAppId: attachment.app.id,
          attachedAppName: attachment.app.name,
          owningAppId: attachment.addon.app.id,
          owningAppName: attachment.addon.app.name,
          createdAt: localizeDate(attachment.created_at),
          updatedAt: localizeDate(attachment.updated_at),
          relationship: attachment.addon.app.id === attachment.app.id ? 'direct' : 'attachment'
        }))
      ], []);

    if (format === 'json') {
      cli.log(JSON.stringify(jsonResults, null, 2));
    } else {
      ux.table(jsonResults.attachments, {
        addonName: {header: 'Add-On Name'},
        attachmentName: {header: 'Attachment Name'},
        // attachmentId: {header: ''},
        relationship: {header: 'Relationship'},
        // addonId: {header: ''},
        // webURL: {header: ''},
        // logInputURL: {header: ''},
        // owningAppId: {header: ''},
        owningAppName: {header: 'Owning App'},
        // attachedAppId: {header: ''},
        attachedAppName: {header: 'Attached App'},
        updatedAt: {header: 'Updated At'},
        createdAt: {header: 'Created At'},
        ...tableTimestamp
      }, tableFormat);
    }

    return Promise.resolve(results);
  }
}

AddonStatusCommand.description = `List of Add-Ons at the attachment level.

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
`;

AddonStatusCommand.flags = {
  app: flags.string({char: 'a', description: 'comma separated list of app names or ids'}),
  user: flags.string({char: 'u', description: 'account email or user id'}),
  team: flags.string({char: 't', description: 'team name or id'}),
  format: flags.string({char: 'f', description: 'format of output', default: 'human', options: ['human', 'json', 'csv']}),
  cache: flags.boolean({hidden: true, description: 'store the app results into a cache file ./data.json'})
};

module.exports = AddonStatusCommand;
