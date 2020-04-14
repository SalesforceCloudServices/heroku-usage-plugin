
/* eslint-disable no-unused-vars */
const {Command, flags} = require('@heroku-cli/command');
const {CustomColors, color} = require('@heroku-cli/color');
const {ux} = require('cli-ux');
const cli = require('heroku-cli-util');
/* eslint-enable no-unused-vars */

/* format for requesting the apps for a given team */
const generateTeamAppsURL = (team) => `/teams/${team}/apps`;
const generateUserAppsURL = (user) => `/users/${user}/apps`;
const generateCurrentUserAppsURL = () => '/apps';

class AppsCommand extends Command {
  async run() {
    let results;

    const {flags: commandFlags} = this.parse(AppsCommand);
    let team = commandFlags.team || null;
    let user = commandFlags.user || null;
    const format = commandFlags.format || 'human';
    let silent = commandFlags.silent || false;

    const {apiURL, apiName} = AppsCommand.getTargetInfo(team, user);

    try {
      ux.action.start(`Retrieiving apps ${apiName}`);
      //-- this is the only line required to request from heroku
      let {body} = await this.heroku.get(apiURL);
      ux.action.stop();

      let appList = body.map(({name}) => name);
      results = appList;

      if (silent) {
        //-- do nothing
      } else if (format === 'json') {
        cli.log(JSON.stringify(appList, null, 2));
      } else {
        cli.log(appList.join('\n'));
      }
    } catch (error) {
      if (error.statusCode === 401) {
        cli.error('not logged in', {exit: 100});
      }
      throw error;
    }

    return Promise.resolve(results);
  }

  static getTargetInfo(team, user) {
    let apiURL;
    let apiName;

    if (team) {
      apiURL = generateTeamAppsURL(team);
      apiName = `for team: ${team}`;
    } else if (user) {
      apiURL = generateUserAppsURL(user);
      apiName = `for user: ${user}`;
    } else {
      apiURL = generateCurrentUserAppsURL();
      apiName = 'for your current user';
    }

    return {apiURL, apiName};
  }
}

AppsCommand.description = `Determines the list of apps available: by user or team.

(If no user or term is specified, then the apps available to the current user is provided)
`;

AppsCommand.flags = {
  user: flags.string({char: 'u', description: 'account email or id or self'}),
  team: flags.string({char: 't', description: 'team name or id'}),
  format: flags.string({char: 'f', description: 'format of output', default: 'human', options: ['human', 'json', 'csv']}),
  silent: flags.boolean({char: 's', hidden: true, description: 'Run silently for use in other methods'})
};

module.exports = AppsCommand;
