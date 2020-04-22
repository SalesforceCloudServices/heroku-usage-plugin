
/* eslint-disable no-unused-vars, quote-props */
const chai = require('chai');
const {expect} = chai;

const mocha = require('mocha');
const {it, beforeEach, afterEach} = mocha;

const nock = require('nock');

const {test} = require('@oclif/test');

const cli = require('heroku-cli-util');
/* eslint-enable no-unused-vars */

const HerokuPostgresCommand = require('../../src/modules/HerokuPostgresCommand');

/** Example table */
const TABLE_EXAMPLE_1 = `
Table    |  Size   | External Size 
------------+---------+---------------
  daily      | 1072 kB | 648 kB
  monthly    | 424 kB  | 272 kB
  addon      | 344 kB  | 200 kB
  app        | 296 kB  | 152 kB
  attachment | 264 kB  | 112 kB
  dyno       | 216 kB  | 120 kB
(6 rows)`;
const TABLE_EXAMPLE_1_ARRAY = [['Table', 'Size', 'External Size'],
  ['daily', '1072 kB', '648 kB'],
  ['monthly', '424 kB', '272 kB'],
  ['addon', '344 kB', '200 kB'],
  ['app', '296 kB', '152 kB'],
  ['attachment', '264 kB', '112 kB'],
  ['dyno', '216 kB', '120 kB']];
const TABLE_EXAMPLE_1_JSON = [{'Table': 'daily', 'Size': '1072 kB', 'External Size': '648 kB'},
  {'Table': 'monthly', 'Size': '424 kB', 'External Size': '272 kB'},
  {'Table': 'addon', 'Size': '344 kB', 'External Size': '200 kB'},
  {'Table': 'app', 'Size': '296 kB', 'External Size': '152 kB'},
  {'Table': 'attachment', 'Size': '264 kB', 'External Size': '112 kB'},
  {'Table': 'dyno', 'Size': '216 kB', 'External Size': '120 kB'}];

const TABLE_EXAMPLE_2 = `
id |                                                                                                                               str                                                                                                                               
----+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  1 | normal text                                                                                                                                                                                                                                                    
  2 | something with "quotes" in it                                                                                                                                                                                                                                  
  3 | something with a vertical | pipe                                                                                                                                                                                                                               
(3 rows)`;
const TABLE_EXAMPLE_2_ARRAY = [['id', 'str'],
  ['1', 'normal text'],
  ['2', 'something with "quotes" in it'],
  ['3', 'something with a vertical', 'pipe']];
const TABLE_EXAMPLE_2_JSON = [{'id': '1', 'str': 'normal text'},
  {'id': '2', 'str': 'something with "quotes" in it'},
  {'id': '3', 'str': 'something with a vertical'}];

const EXAMPLE_ERROR = `
--> Connecting to postgresql-clear-89313
ERROR:  syntax error at or near "something"
LINE 1: something
        ^
`;

describe('Table Output Conversion', () => {
  describe('for a happy path table', () => {
    it('converts to an array', () => {
      const tableStr = TABLE_EXAMPLE_1;
      const expected = TABLE_EXAMPLE_1_ARRAY;
      const result = HerokuPostgresCommand.tableToArray(tableStr);
      // console.log(JSON.stringify(result));
      expect(result).to.deep.equal(expected);
    });
  
    it('converts to an array of objects', () => {
      const tableStr = TABLE_EXAMPLE_1;
      const expected = TABLE_EXAMPLE_1_JSON;
      const result = HerokuPostgresCommand.tableToObjectArray(tableStr);
      // console.log('result', JSON.stringify(result));
      expect(result).to.deep.equal(expected);
    });
  });

  describe('for a table with pipes in it', () => {
    it('converts to an array', () => {
      const tableStr = TABLE_EXAMPLE_2;
      const expected = TABLE_EXAMPLE_2_ARRAY;
      const result = HerokuPostgresCommand.tableToArray(tableStr);
      // console.log(JSON.stringify(result));
      expect(result).to.deep.equal(expected);
    });
  
    it('converts to an array of objects', () => {
      const tableStr = TABLE_EXAMPLE_2;
      const expected = TABLE_EXAMPLE_2_JSON;
      const result = HerokuPostgresCommand.tableToObjectArray(tableStr);
      // console.log('result', JSON.stringify(result));
      expect(result).to.deep.equal(expected);
    });
  });
});
