
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

const HerokuPostgresQuery = require('../../../modules/HerokuPostgresQuery');

class SizeCommand extends Command {
  async run() {
    let results;
    let stdOutResults;
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
      const {stdout, stderr} = await HerokuPostgresQuery.execExtra(`heroku pg:table-size -a "${app}"`);
      ux.action.stop();

      stdOutResults = stdout;
      results = HerokuPostgresQuery.tableToArray(stdout);
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
      cli.log(stdOutResults);
      // ux.table(stdOutResults, {
      //   name: {header: 'Name'}
      // }, tableFormat);
    }

    return Promise.resolve(results);
  }
}

SizeCommand.description = `Performs a query against the postgres database of a specific app.

(Note: this is intended to be similar to pg:psql - with the added ability to export as JSON)


`;

SizeCommand.flags = {
  app: flags.string({char: 'a', required:true, description: 'App to run the command against'}),
  format: flags.string({char: 'f', description: 'format of output', default: 'human', options: ['human', 'json', 'csv']}),
  silent: flags.boolean({char: 's', hidden: true, description: 'Run silently for use in other methods'})
};

module.exports = SizeCommand;