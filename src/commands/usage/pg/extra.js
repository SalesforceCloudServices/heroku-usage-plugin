
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

class ExtraCommand extends Command {
  async run() {
    let results;
    // let stdOutResults;
    const {flags: commandFlags} = this.parse(ExtraCommand);
    const format = commandFlags.format || 'human';
    const silent = commandFlags.silent || false;

    const app = commandFlags.app || null;
    const command = commandFlags.command || null;

    const tableFormat = {
      csv: format === 'csv',
      'no-truncate': format === 'csv'
    };

    try {
      ux.action.start('Retrieving');
      //-- @TODO:
      const {stdout, stderr} = await HerokuPostgresCommand.execExtra(`heroku pg:${command} -a "${app}"`);
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

ExtraCommand.description = `Wrapper for running a heroku-pg-extras plugin with additional output options.
For example: human readible format, csv and JSON.

(Note that this assumes that the pg-extras)

For more information, please see:
https://github.com/heroku/heroku-pg-extras
`;

ExtraCommand.flags = {
  app: flags.string({char: 'a', required: true, description: 'App to run the command against'}),
  command: flags.string({char: 'c', required: true, description: 'The pg:[COMMAND] to run. (ex: seq-scans, size-table, etc.)'}),
  // -- ['cache-hit', 'index-usage', 'locks', 'outliers', 'calls', 'blocking', 'total-index-size', 'index-size', 'table-size',
  //  'table-indexes-size', 'total-table-size', 'unused-indexes', 'seq-scans', 'long-running-queries', 'records-rank', 'bloat',
  //  'vacuum-stats', 'user-connections', 'mandelbrot']
  format: flags.string({char: 'f', description: 'format of output', default: 'human', options: ['human', 'json', 'csv']}),
  silent: flags.boolean({char: 's', hidden: true, description: 'Run silently for use in other methods'})
};

module.exports = ExtraCommand;

