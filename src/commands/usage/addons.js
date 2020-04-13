
/* eslint-disable no-unused-vars, no-await-in-loop */
const {Command, flags} = require('@heroku-cli/command');
const {CustomColors, color} = require('@heroku-cli/color');
const {ux} = require('cli-ux');
const cli = require('heroku-cli-util');
/* eslint-enable no-unused-vars */

const ListCommand = require('./list');

class AddonsCommand extends Command {
  async run() {
    let results;
    const {flags: commandFlags} = this.parse(AddonsCommand);
    const appFlag = commandFlags.app || null;
    const user = commandFlags.user || null;
    const team = commandFlags.team || null;
    const json = commandFlags.json || false;
    let appList;

    const localizeDate = (d) => (d ? new Date(d).toLocaleString() : null);
    const printCost = (cost) => (cost ?
      `${cost.contract ? 'under contract for ' : ''}${cost.cents / 100}$${cost.unit ? `/${cost.unit}` : ''}` :
      '');

    if (appFlag) {
      appList = appFlag.split(/\s*,\s*/);
    } else {
      let args = ['-s'];
      if (team) {
        args = [...args, '-t', team];
      } else if (user) {
        args = [...args, '-u', user];
      }
      appList = await ListCommand.run(args);
    }

    results = {};
    // results = require('../../../.tmp/data.json');
    
    try {
      let appName;
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
        appName = appList[index];
        
        ux.action.start(`Retrieving info for ${CustomColors.app(appName)}`);
        
        apiURL = `/apps/${appName}`;
        const {body: appBody} = await this.heroku.get(apiURL);
        
        apiURL = `/apps/${appName}/addons`;
        const {body: addonBody} = await this.heroku.get(apiURL);

        apiURL = `/apps/${appName}/addon-attachments`;
        const {body: attachmentsBody} = await this.heroku.get(apiURL);
        
        apiURL = `/apps/${appName}/dynos`;
        let {body: dynoBody} = await this.heroku.get(apiURL);
        dynoBody = dynoBody.map((dyno) => ({...dyno, cost: dynoSizes[dyno.size].cost}));
        
        ux.action.stop();

        results[appName] = {appBody, attachmentsBody, addonBody, dynoBody};
      }
    } catch (error) {
      if (error.statusCode === 401) {
        cli.error('not logged in', {exit: 100});
      }
      throw error;
    }

    const addonRecords = Object.keys(results)
      .map((key) => results[key])
      .reduce((appListResults, app) => [
        ...appListResults,
        ...app.addonBody.reduce((addonListResults, addon) => [
          ...addonListResults, {
            appId: addon.app.id,
            appName: addon.app.name,
            name: addon.name,
            addonId: addon.id,
            planName: addon.plan.name,
            billedPrice: printCost(addon.billed_price),
            state: addon.state,
            updatedAt: localizeDate(addon.updated_at),
            createdAt: localizeDate(addon.created_at)
          }
        ], [])
      ], []);

    if (json) {
      cli.log(JSON.stringify(addonRecords, null, 2));
    } else {
      ux.table(addonRecords, {
        // addonId: {header: 'Add-On Id'},
        // appId: {header: 'App Id'},
        appName: {header: 'App Name'},
        name: {header: 'Add-On Name'},
        planName: {header: 'Plan'},
        billedPrice: {header: 'Cost'},
        updatedAt: {header: 'Updated At'},
        createdAt: {header: 'Created At'}
      });
    }

    return Promise.resolve(results);
  }

  /**
   * Determines the info for a given app
   * @param {string} app -
   */
}

AddonsCommand.description = `Determines the usage and cost of the Add-Ons associated with a list of apps
...
Extra documentation goes here addons
`;

AddonsCommand.flags = {
  app: flags.string({char: 'a', description: 'comma separated list of app names or ids'}),
  user: flags.string({char: 'u', description: 'account email or id or self'}),
  team: flags.string({char: 't', description: 'team name or id'}),
  json: flags.boolean({char: 'j', description: 'provide the output as JSON'})
};

module.exports = AddonsCommand;
