
/**
 * Makes a postgres query against a specific application
 */

/* eslint-disable no-unused-vars, camelcase */
const {Command, flags} = require('@heroku-cli/command');
const {CustomColors, color} = require('@heroku-cli/color');
const {ux} = require('cli-ux');
const cli = require('heroku-cli-util');
const fs = require('fs-extra');
const path = require('path');
/* eslint-enable no-unused-vars */

const HerokuPostgresCommand = require('../../../modules/HerokuPostgresCommand');

class SizeCommand extends Command {
  async run() {
    let results;
    // let stdOutResults;
    const {flags: commandFlags} = this.parse(SizeCommand);
    const format = commandFlags.format || 'human';
    const silent = commandFlags.silent || false;

    const app = commandFlags.app || null;

    const tableFormat = {
      csv: format === 'csv',
      'no-truncate': format === 'csv'
    };

    try {
      ux.action.start('Retrieving');
      //-- @TODO:
      const {stdout, stderr} = await HerokuPostgresCommand.execExtra(`heroku pg:table-size -a "${app}"`);
      ux.action.stop();

      results = HerokuPostgresCommand.tableToArray(stdout);

      if (silent) {
        //-- do nothing
      } else if (format === 'json') {
        // results = HerokuPostgresCommand.tableToObjectArray(stdout);
        cli.log(JSON.stringify(results, null, 2));
      } else if (results.length === 0) {
        cli.log('-- No results found --');
      } else {
        const resultsHeader = HerokuPostgresCommand.generateTableArrayHeaders(results);
        const resultsBody = results.slice(1);
        ux.table(resultsBody, resultsHeader, tableFormat);
      }
    } catch (error) {
      if (error.statusCode === 401) {
        cli.error('not logged in', {exit: 100});
      }
      throw error;
    }

    return Promise.resolve(results);
  }
}

SizeCommand.description = `Wrapper for heroku-pg-extras:pg:table-size

Wraps around the heroku-pg-extras command to provide results in additional formats.
Such as human, csv and json.
`;

SizeCommand.flags = {
  app: flags.string({char: 'a', required: true, description: 'App to run the command against'}),
  format: flags.string({char: 'f', description: 'format of output', default: 'human', options: ['human', 'json', 'csv']}),
  silent: flags.boolean({char: 's', hidden: true, description: 'Run silently for use in other methods'})
};

module.exports = SizeCommand;
