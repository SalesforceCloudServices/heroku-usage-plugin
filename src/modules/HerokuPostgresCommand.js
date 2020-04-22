
const {exec} = require('child-process-promise');
// const fs = require('fs-extra');
// const path = require('path');

class HerokuPostgresCommand {
  static executeQuery(app, command, filePath) {
    let cmdArguments = `heroku pg:psql -a "${app}" `;
    cmdArguments = filePath ?
      `${cmdArguments} -f "${filePath}"` :
      `${cmdArguments} -c "${command}"`;
    
    console.log(`executing command:${cmdArguments}`);

    return exec(cmdArguments);

    /*
    //-- spawn option

    const resultPromise = new Promise((resolve, reject) => {
      let cmdArguments = [];
      if (filePath) {
        cmdArguments = [...cmdArguments, '-f', filePath];
      } else {
        cmdArguments = [...cmdArguments, '-c', command];
      }
      cmdArguments = ['heroku', ['pg:psql', ...cmdArguments]];
      console.log(`executing arguments: ${cmdArguments}`);

      const execPromise = spawn(cmdArguments);
      const {childProcess} = execPromise;
      const {pid} = childProcess;

      exec()

      childProcess.stdout.on()

      resolve(execArguments);
    });
    return resultPromise;
    */
  }

  static execExtra(command) {
    return exec(command);
  }

  static tableToArray(str) {
    const results = [];
  
    if (!str) return results;
  
    let rows = str.trim().split(/[\r\n]+/)
      .filter(
        (lineStr) => lineStr &&
        !lineStr.match(/^[-+]+$/) &&
        !lineStr.match(/^\(\s*[\d,]+\s*rows\s*\)/)
      )
      .map((lineStr) => lineStr.split(/\|/)
        .map((str) => str.trim())
      );
    
    return (rows);
  }

  static tableToObjectArray(str) {
    const results = [];

    if (!str) return results;

    const rowCells = HerokuPostgresCommand.tableToArray(str);

    const header = rowCells[0];
    const body = rowCells.slice(1, rowCells.length);
    let headerKey;

    const bodyArray = body.map((row) => row.reduce((result, cell, index) => {
      if (index < header.length) {
        headerKey = header[index];
        result[headerKey] = cell;
      }
      return result;
    }, {}));

    return bodyArray;
  }
}

module.exports = HerokuPostgresCommand;
