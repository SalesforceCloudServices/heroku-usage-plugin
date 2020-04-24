
const cpp = require('child-process-promise');
// const fs = require('fs-extra');
// const path = require('path');

/**
 * Module to execute a heroku postgres command.
 * (Either through a specific query or through heroku-pg-extra)
 */
class HerokuPostgresCommand {
  static executeQuery(app, command, filePath) {
    let cmdArguments = ['pg:psql', '-a', app];

    if (filePath) {
      cmdArguments = [...cmdArguments, '-f', filePath];
    } else {
      cmdArguments = [...cmdArguments, '-c', command];
    }
    let cmd = ['heroku', cmdArguments];
    
    //-- @TODO: remove/cleanup
    console.log(`executing command:${cmd[0]} ${cmd[1].join(' ')}`);

    const resultPromise = new Promise((resolve, reject) => {
      const spawnPromise = cpp.spawn.apply(this, cmd);
      const {childProcess} = spawnPromise;
      const {pid} = childProcess;

      let stdout = '';
      let stderr = '';
      childProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      childProcess.stderr.on('data', (data) => {
        stderr += data.toString();
        console.error(`${data.toString()}`);
      });

      spawnPromise.then(() => {
        if (stderr && stderr.match(/^-->.+\s+$/)) {
          resolve({stdout, stderr});
        } else {
          const err = new Error(stderr);
          err.statusCode = 400;
          reject(err);
        }
      })
        .catch((error) => {
          reject(error);
        });

      /*
      exec(cmdArguments)
        .then(function (execResult) {
          let {stderr} = execResult;
          if (stderr && stderr.match(/^-->.+\s+$/)) {
            resolve.apply(this, arguments);
          } else {
            const err = new Error(stderr);
            err.statusCode = 400;
            reject(err);
          }
        })
        .catch(() => {
          reject.apply(this, arguments);
        });
      */
    });
    return resultPromise;

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

  static generateTableArrayHeaders(a) {
    let results = [];
    if (a.length > 0) {
      results = a[0].reduce((headerObj, header, index) => {
        headerObj[index] = {header};
        return headerObj;
      }, {});
    }
    return results;
  }

  static tableToObjectArray(str) {
    let results = [];

    if (!str) return results;

    const rowCells = HerokuPostgresCommand.tableToArray(str);

    if (rowCells.length > 0) {
      const header = rowCells[0];
      const body = rowCells.length < 2 ? [] : rowCells.slice(1);
      let headerKey;

      results = body.map((row) => row.reduce((rowObj, cell, index) => {
        if (index < header.length) {
          headerKey = header[index];
          rowObj[headerKey] = cell;
        }
        return rowObj;
      }, {}));
    }

    return results;
  }
}

module.exports = HerokuPostgresCommand;
