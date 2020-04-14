
/* eslint-disable no-unused-vars, camelcase */
const {Command, flags} = require('@heroku-cli/command');
const {CustomColors, color} = require('@heroku-cli/color');
const {ux} = require('cli-ux');
const cli = require('heroku-cli-util');
/* eslint-enable no-unused-vars */

const generateDailyUsageURL = (teamIdOrName, start, end) => `/teams/${teamIdOrName}/usage/daily?start=${start}&end=${end}`;
const generateTeamInfoURL = (teamIdOrName) => `/teams/${teamIdOrName}`;

class DailyCommand extends Command {
  async run() {
    let apiURL;
    let results;
    let stdOutResults;
    const yesterday = DailyCommand.getYesterday();
    const {flags: commandFlags} = this.parse(DailyCommand);
    let accountId = commandFlags.account || null;
    const teamId = commandFlags.team || null;
    const format = commandFlags.format || 'human';
    let silent = commandFlags.silent || false;
    let begin = commandFlags.begin || null;
    let end = commandFlags.end || null;

    if (!accountId && !teamId) {
      cli.error('Please specify either an Enterprise Account Id or Team Id');
      return;
    }

    const tableFormat = {
      csv: format === 'csv',
      'no-truncate': format === 'csv'
    };

    if (!begin) {
      begin = yesterday.toISOString().slice(0, 10);
    }
    if (!end) {
      end = yesterday.toISOString().slice(0, 10);
    }

    try {
      if (!accountId) {
        ux.action.start('Team Info');
        apiURL = generateTeamInfoURL(teamId);
        const {body: teamResults} = await this.heroku.get(apiURL);
        ux.action.stop();
        accountId = teamResults.id;
      }

      ux.action.start('Retrieving');
      apiURL = generateDailyUsageURL(accountId, begin, end);
      const {body: usageResults} = await this.heroku.get(apiURL);
      ux.action.stop();

      results = [];
      usageResults.forEach(({apps, ...usageResult}) => {
        results = [...results, ...apps.map((appUsage) => ({
          ...appUsage,
          date: usageResult.date,
          space: '',
          connect: '',
          name: usageResult.name
        }))];
        //-- add in the total result
        results.push({
          app_name: '-total-',
          connect: '',
          ...usageResult
        });
      });

      stdOutResults = results;
    } catch (error) {
      if (error.statusCode === 401) {
        cli.error('not logged in', {exit: 100});
      }
      throw error;
    }

    if (silent) {
      //-- do nothing
    } else if (format === 'json') {
      cli.log(JSON.stringify(results, null, 2));
    } else {
      ux.table(stdOutResults, {
        name: {header: 'Team'},
        app_name: {header: 'App Name'},
        date: {header: 'Date'},
        addons: {header: 'Add-Ons'},
        dynos: {header: 'Dynos'},
        // connect: {header: 'Connect'},
        data: {header: 'Data'},
        partner: {header: 'Partner'},
        space: {header: 'Spaces'}
      }, tableFormat);
    }

    return Promise.resolve(results);
  }

  static getYesterday() {
    const result = new Date();
    result.setDate(new Date().getDate() - 1);
    return result;
  }
}

DailyCommand.description = `Usage for an Enterprise Account / Team at a Daily resolution.

Team: Name of the Enterprise Account / Team
App: Application Name
Date: Date of the usage
Addons: Total add-on credits used
Dynos: Dyno credits used
Data: Add-On credits used for first party add-ons
Partner: Add-On credits used for third party add-ons
Space: Private Space credits used

https://devcenter.heroku.com/articles/platform-api-reference#enterprise-account-daily-usage
`;

DailyCommand.flags = {
  account: flags.string({char: 'a', description: 'Enterprise Account Id'}),
  team: flags.string({char: 't', description: 'Heroku Team Id'}),
  format: flags.string({char: 'f', description: 'format of output', default: 'human', options: ['human', 'json', 'csv']}),
  begin: flags.string({char: 'b', description: 'Inclusive Start YYYY-MM-DD to ask from'}),
  end: flags.string({char: 'e', description: 'Inclusive End YYYY-MM-DD to ask until'}),
  silent: flags.boolean({char: 's', hidden: true, description: 'Run silently for use in other methods'})
};

module.exports = DailyCommand;
