
/* eslint-disable no-unused-vars, camelcase */
const {Command, flags} = require('@heroku-cli/command');
const {CustomColors, color} = require('@heroku-cli/color');
const {ux} = require('cli-ux');
const cli = require('heroku-cli-util');
/* eslint-enable no-unused-vars */

const generateMonthyUsageURL = (teamIdOrName, start, end) => `/teams/${teamIdOrName}/usage/monthly?start=${start}&end=${end}`;
const generateTeamInfoURL = (teamIdOrName) => `/teams/${teamIdOrName}`;

const formatNumber = (n) => n ? (n).toLocaleString() : '';

class MonthlyCommand extends Command {
  async run() {
    let apiURL;
    let results;
    let stdOutResults;
    const {flags: commandFlags} = this.parse(MonthlyCommand);
    const teamId = commandFlags.team || null;
    let json = commandFlags.json || false;
    let silent = commandFlags.silent || false;
    let begin = commandFlags.begin || null;
    let end = commandFlags.end || null;

    if (!begin) {
      begin = new Date().toISOString().slice(0, 7);
    }
    if (!end) {
      end = new Date().toISOString().slice(0, 7);
    }

    // const saying = `hello name`;
    // const msg = `${color.magenta(saying)} from your friends at ${CustomColors.heroku('heroku')}`;

    try {
      ux.action.start('Team Info');
      apiURL = generateTeamInfoURL(teamId);
      const {body: teamResults} = await this.heroku.get(apiURL);
      ux.action.stop();

      ux.action.start('Retrieving');
      apiURL = generateMonthyUsageURL(teamResults.id, begin, end);
      const {body: usageResults} = await this.heroku.get(apiURL);
      ux.action.stop();

      results = [];
      usageResults.forEach(({apps, ...usageResult}) => {
        results = [...results, ...apps.map((appUsage) => ({
          ...appUsage,
          month: usageResult.month,
          space: '',
          name: usageResult.name
        }))];
        results.push({
          app_name: '-total-',
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
    } else if (json) {
      cli.log(JSON.stringify(results, null, 2));
    } else {
      ux.table(stdOutResults, {
        name: {header: 'Team'},
        app_name: {header: 'App Name'},
        month: {header: 'Date'},
        addons: {header: 'addons'},
        dynos: {header: 'dynos'},
        connect: {header: 'connect'},
        data: {header: 'data'},
        partner: {header: 'partner'},
        space: {header: 'spaces'}
      });
    }

    return Promise.resolve(results);
  }
}

MonthlyCommand.description = `Describe the command here
...
Extra documentation goes here
`;

MonthlyCommand.flags = {
  team: flags.string({char: 't', description: 'Heroku Team Id', required: true}),
  json: flags.boolean({char: 'j', description: 'provide the output as JSON'}),
  silent: flags.boolean({char: 's', description: 'Run silently for use in other methods'}),
  begin: flags.string({char: 'b', description: 'Inclusive Start YYYY-MM to ask from'}),
  end: flags.string({char: 'e', description: 'Inclusive End YYYY-MM to ask until'})
};

module.exports = MonthlyCommand;
