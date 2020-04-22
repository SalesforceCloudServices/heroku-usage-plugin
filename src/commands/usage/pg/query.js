
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

const EXAMPLE_TABLE = `
Table    |  Size   | External Size 
------------+---------+---------------
  daily      | 1072 kB | 648 kB
  monthly    | 424 kB  | 272 kB
  addon      | 344 kB  | 200 kB
  app        | 296 kB  | 152 kB
  attachment | 264 kB  | 112 kB
  dyno       | 216 kB  | 120 kB
(6 rows)`;

class DailyCommand extends Command {
  async run() {
    let results;
    let stdOutResults;
    const {flags: commandFlags} = this.parse(DailyCommand);
    const format = commandFlags.format || 'human';
    const silent = commandFlags.silent || false;

    const app = commandFlags.app || null;
    let command = commandFlags.command || null;
    const file = commandFlags.file || null;

    if (!command && !file) {
      cli.error('Please specify either `command` or `file` to specify the query to execute');
      return;
    }

    if (file) {
      const filePath = path.resolve(file);
      if (fs.pathExistsSync(filePath)) {
        const fileContents = fs.readFileSync(filePath, {encoding: 'UTF-8'});
        command = fileContents;
      } else {
        cli.error(`Unable to find file: ${filePath}`);
        return;
      }
    }

    if (!command) {
      cli.error('No command found to run. Halting');
      return;
    }

    const tableFormat = {
      csv: format === 'csv',
      'no-truncate': format === 'csv'
    };

    try {
      ux.action.start('Retrieving');
      cli.log(`now executing command against app: ${app}\n${command}`);
      const {stdout, stderr} = await HerokuPostgresCommand.executeQuery(app, command, file);
      ux.action.stop();

      if (silent) {
        //-- do nothing
      } else if (format === 'json') {
        results = HerokuPostgresCommand.tableToObjectArray(stdout);
        cli.log(JSON.stringify(results, null, 2));
      } else if (results.length === 0) {
        cli.log('-- No results found --');
      } else {
        results = HerokuPostgresCommand.tableToArray(stdout);
  
        const resultsHeader = results[0].reduce((headerObj, header, index) => {
          headerObj[index] = {header};
          return headerObj;
        }, {});
        // ({...headerObj, ({header})}), {});
        const resultsBody = (results.length === 1) ? [] : results.slice(1);
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

DailyCommand.description = `Performs a query against the postgres database of a specific app.

(Note: this is intended to be similar to pg:psql - with the added ability to export as JSON)


`;

DailyCommand.flags = {
  app: flags.string({char: 'a', required:true, description: 'App to run the command against'}),
  command: flags.string({char: 'c', description: 'SQL command to run'}),
  file: flags.string({char: 'l', description: 'Path to file with SQL command to run'}),
  format: flags.string({char: 'f', description: 'format of output', default: 'human', options: ['human', 'json', 'csv']}),
  silent: flags.boolean({char: 's', hidden: true, description: 'Run silently for use in other methods'})
};

module.exports = DailyCommand;