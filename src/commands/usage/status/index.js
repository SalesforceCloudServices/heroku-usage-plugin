
/* eslint-disable no-unused-vars, no-await-in-loop */
const {Command, flags} = require('@heroku-cli/command');
const {CustomColors, color} = require('@heroku-cli/color');
const {ux} = require('cli-ux');
const cli = require('heroku-cli-util');

const path = require('path');
const fs = require('fs-extra');
/* eslint-enable no-unused-vars */

const AppsCommand = require('../app-list');
const ObjectUtil = require('../../../modules/ObjectUtil');
const PrintUtil = require('../../../modules/PrintUtil');

class StatusCommand extends Command {
  async run() {
    let results;
    let jsonResults = {};
    const {flags: commandFlags} = this.parse(StatusCommand);
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

    results = await this.getStatus(appList, true, true);

    const allAddons = this.getAllAddons(results);

    const allDynos = this.getAllDynos(results);

    jsonResults.addons = allAddons.map((addon) => ({
      appId: addon.app.id,
      appName: addon.app.name,
      name: addon.name,
      service: addon.addon_service.name,
      addonId: addon.id,
      attachments: localizeNumber(addon.addonAttachments.length),
      planName: printPlan(addon.plan.name),
      cost: printCost(addon.billed_price),
      unit: printUnit(addon.billed_price),
      state: addon.state,
      updatedAt: localizeDate(addon.updated_at),
      createdAt: localizeDate(addon.created_at)
    }));

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

    jsonResults.apps = Object.keys(results)
      .map((key) => results[key])
      .map((app) => ({
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

      cli.log('\n');

      ux.table(jsonResults.dynos, {
        // appId: {header: 'Add-On Name'},
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

      cli.log('\n');

      ux.table(jsonResults.apps, {
        // appId: {header: 'App Id'},
        appName: {header: 'App Name'},
        region: {header: 'Region'},
        maintenance: {header: 'Maintenance'},
        repoSize: {header: 'Repo Size'},
        slugSize: {header: 'Slug Size'},
        space: {header: 'Space'},
        updatedAt: {header: 'Updated At'},
        createdAt: {header: 'Created At'}
      }, tableFormat);
    }

    // cli.log('success');

    return Promise.resolve(results);
  }

  /**
   * Determines the status information for a list of apps
   * @param {String[]} appList - list of applications we will consider
   * @param {Boolean} fetchAddons - whether to fetch addon information
   * @param {Boolean} fetchDynos - whether to fetch dyno information
   */
  async getStatus(appList, fetchAddons, fetchDynos) {
    try {
      const results = {};
      let resultRecord;
      let appName;
      let appRequestLabel;
      let apiURL;
      let dynoSizes;
      
      ux.action.start('Retrieving info for dyno sizes');
      apiURL = '/dyno-sizes';
      const {body: dynoSizeBody} = await this.heroku.get(apiURL);
      ux.action.stop();

      dynoSizes = dynoSizeBody.reduce((result, dynoSize) => {
        result[dynoSize.name] = dynoSize;
        return result;
      }, {});

      for (let index = 0; index < appList.length; index++) {
        resultRecord = {};

        appName = appList[index];
        appRequestLabel = `Retrieving info for ${CustomColors.app(appName)}`;

        ux.action.start(appRequestLabel);
        apiURL = `/apps/${appName}`;
        const {body: appBody} = await this.heroku.get(apiURL);
        resultRecord.appBody = appBody;
        
        if (fetchAddons) {
          // ux.action.start(appRequestLabel, 'Add-Ons', actionOptions);
          apiURL = `/apps/${appName}/addons`;
          const {body: addonBody} = await this.heroku.get(apiURL);
          resultRecord.addonBody = addonBody;
          
          // ux.action.start(appRequestLabel, 'Attachments', actionOptions);
          apiURL = `/apps/${appName}/addon-attachments`;
          const {body: attachmentsBody} = await this.heroku.get(apiURL);
          resultRecord.attachmentsBody = attachmentsBody;
        }
        
        if (fetchDynos) {
          // ux.action.start(appRequestLabel, 'Dynos', actionOptions);
          apiURL = `/apps/${appName}/dynos`;
          let {body: dynoBody} = await this.heroku.get(apiURL);

          dynoBody = dynoBody.map((dynoInfo) => ({
            ...dynoInfo,
            sizeInfo: dynoSizes[dynoInfo.size]
          }));
          resultRecord.dynoBody = dynoBody;
        }
        
        ux.action.stop('done waiting');

        results[appName] = resultRecord;
      }

      // fs.writeFileSync(
      //   path.resolve('./data.json'),
      //   JSON.stringify(results, null, 2),
      //   {encoding: 'UTF8'}
      // );

      return results;
    } catch (error) {
      if (error.statusCode === 401) {
        cli.error('not logged in', {exit: 100});
      }
      throw error;
    }
  }

  /**
   * Determines the list of all add-ons per the results
   * @visibility private
   * @param {*} results - results from getStatus
   * @returns {[]} - collection of all addons
   */
  getAllAddons(results) {
    const attachedAddons = Object.keys(results)
      .map((key) => results[key])
      .reduce((allAttachments, app) => [
        ...allAttachments,
        ...app.attachmentsBody
      ], [])
      .filter((attachment) => attachment.app.name !== attachment.addon.app.name);

    const allAddons = ObjectUtil.findUnique(
      (addon) => addon.id,
      Object.keys(results)
        .map((key) => results[key])
        .reduce((addonResults, app) => [
          ...addonResults, ...app.addonBody
        ], [])
    );
    
    allAddons.forEach((addon) => {
      //-- add a new property called addonAttachments
      addon.addonAttachments = [
        addon.app,
        ...attachedAddons.filter((attachment) => attachment.addon.id === addon.id)
          .map((matchedAttachment) => matchedAttachment.app)
      ];
    });

    return allAddons;
  }

  /**
   * Determines the list of all dynos per the results.
   * @visibility private
   * @param {*} results - results from getStatus
   * @returns {[]} - collection of all dynos
   */
  getAllDynos(results) {
    const allDynos = Object.keys(results)
      .map((key) => results[key])
      .reduce((dynoResults, app) => [
        ...dynoResults,
        ...app.dynoBody
      ], []);
    return allDynos;
  }
}

StatusCommand.description = `Current add-on / dyno / app status.

(Please note that if neither a team or user is specified, all apps for the current user are determined)

This includes the add-ons status, dynos status, and app status commands.

Please see those commands for more detail.
`;

StatusCommand.flags = {
  app: flags.string({char: 'a', description: 'comma separated list of app names or ids'}),
  user: flags.string({char: 'u', description: 'account email or user id'}),
  team: flags.string({char: 't', description: 'team name or id'}),
  format: flags.string({char: 'f', description: 'format of output', default: 'human', options: ['human', 'json', 'csv']})
};

module.exports = StatusCommand;
