
/* eslint-disable no-unused-vars */
const chai = require('chai');
const {expect} = chai;

const mocha = require('mocha');
const {it, beforeEach, afterEach} = mocha;

const nock = require('nock');

const {test} = require('@oclif/test');

const cli = require('heroku-cli-util');
/* eslint-enable no-unused-vars */

const AppCommand = require('../../src/commands/usage/app-list');

const generateApps = (count) => [...new Array(count).keys()].map((index) => ({
  id: `id_${index}`,
  name: `app_name_${index}`
}));

const APPS_EMPTY = generateApps(0);
const APPS_SINGLE = generateApps(1);
const APPS_FIVE = generateApps(5);

describe('AppCommand', () => {
  /**
   * Nock instance that mocks heroku
   * @type {nock}
   */
  let heroku;

  beforeEach(() => {
    heroku = nock('https://api.heroku.com');
    cli.mockConsole();
    cli.exit.mock();
  });

  afterEach(() => {
    nock.cleanAll();
    heroku.done();
  });

  describe('current user', () => {
    it('retrieves apps if there are multiple', () => {
      heroku.get('/apps')
        .reply(200, APPS_FIVE);
      
      return AppCommand.run([])
        .then((results) => {
          const expected = 'app_name_0\napp_name_1\napp_name_2\napp_name_3\napp_name_4\n';
          expect(cli.stdout).to.equal(expected);
          
          expect(results).to.be.ok;
          expect(Array.isArray(results)).to.be.true;
          expect(results.length).to.equal(5);

          const result0 = results[0];
          expect(result0).to.equal('app_name_0');
  
          return Promise.resolve(true);
        });
    });

    it('retrieves apps in json', () => {
      heroku.get('/apps')
        .reply(200, APPS_FIVE);
      
      return AppCommand.run(['-j'])
        .then((results) => {
          const expected = '[\n  "app_name_0",\n  "app_name_1",\n  "app_name_2",\n  "app_name_3",\n  "app_name_4"\n]\n';
          expect(cli.stdout).to.equal(expected);
          
          expect(results).to.be.ok;
          expect(Array.isArray(results)).to.be.true;
          expect(results.length).to.equal(5);

          const result0 = results[0];
          expect(result0).to.equal('app_name_0');
  
          return Promise.resolve(true);
        });
    });

    it('retrieves apps if there are is only one', () => {
      heroku.get('/apps')
        .reply(200, APPS_SINGLE);
      
      return AppCommand.run([])
        .then((results) => {
          const expected = 'app_name_0\n';
          expect(cli.stdout).to.equal(expected);
          
          expect(results).to.be.ok;
          expect(Array.isArray(results)).to.be.true;
          expect(results.length).to.equal(1);

          const result0 = results[0];
          expect(result0).to.equal('app_name_0');
  
          return Promise.resolve(true);
        });
    });

    it('retrieves no apps if there arent any', () => {
      heroku.get('/apps')
        .reply(200, APPS_EMPTY);
      
      return AppCommand.run([])
        .then((results) => {
          const expected = '\n';
          expect(cli.stdout).to.equal(expected);
          
          expect(results).to.be.ok;
          expect(Array.isArray(results)).to.be.true;
          expect(results.length).to.equal(0);
  
          return Promise.resolve(true);
        });
    });
  });

  describe('team user', () => {
    it('retrieves apps if there are multiple', () => {
      heroku.get('/teams/my-team/apps')
        .reply(200, APPS_FIVE);
      
      return AppCommand.run(['-t', 'my-team'])
        .then((results) => {
          const expected = 'app_name_0\napp_name_1\napp_name_2\napp_name_3\napp_name_4\n';
          expect(cli.stdout).to.equal(expected);
          
          expect(results).to.be.ok;
          expect(Array.isArray(results)).to.be.true;
          expect(results.length).to.equal(5);

          const result0 = results[0];
          expect(result0).to.equal('app_name_0');
  
          return Promise.resolve(true);
        });
    });

    it('can retrieve json', () => {
      heroku.get('/teams/my-team/apps')
        .reply(200, APPS_FIVE);
      
      return AppCommand.run(['-t', 'my-team', '-j'])
        .then((results) => {
          const expected = '[\n  "app_name_0",\n  "app_name_1",\n  "app_name_2",\n  "app_name_3",\n  "app_name_4"\n]\n';
          expect(cli.stdout).to.equal(expected);
          
          expect(results).to.be.ok;
          expect(Array.isArray(results)).to.be.true;
          expect(results.length).to.equal(5);

          const result0 = results[0];
          expect(result0).to.equal('app_name_0');
  
          return Promise.resolve(true);
        });
    });

    it('retrieves apps if there are is only one', () => {
      heroku.get('/teams/my-team/apps')
        .reply(200, APPS_SINGLE);
      
      return AppCommand.run(['-t', 'my-team'])
        .then((results) => {
          const expected = 'app_name_0\n';
          expect(cli.stdout).to.equal(expected);
          
          expect(results).to.be.ok;
          expect(Array.isArray(results)).to.be.true;
          expect(results.length).to.equal(1);

          const result0 = results[0];
          expect(result0).to.equal('app_name_0');
  
          return Promise.resolve(true);
        });
    });

    it('retrieves no apps if there arent any', () => {
      heroku.get('/teams/my-team/apps')
        .reply(200, APPS_EMPTY);
      
      return AppCommand.run(['-t', 'my-team'])
        .then((results) => {
          const expected = '\n';
          expect(cli.stdout).to.equal(expected);
          
          expect(results).to.be.ok;
          expect(Array.isArray(results)).to.be.true;
          expect(results.length).to.equal(0);
  
          return Promise.resolve(true);
        });
    });
  });

  describe('specific user', () => {
    it('retrieves apps if there are multiple', () => {
      heroku.get('/users/janet/apps')
        .reply(200, APPS_FIVE);
      
      return AppCommand.run(['-u', 'janet'])
        .then((results) => {
          const expected = 'app_name_0\napp_name_1\napp_name_2\napp_name_3\napp_name_4\n';
          expect(cli.stdout).to.equal(expected);
          
          expect(results).to.be.ok;
          expect(Array.isArray(results)).to.be.true;
          expect(results.length).to.equal(5);

          const result0 = results[0];
          expect(result0).to.equal('app_name_0');
  
          return Promise.resolve(true);
        });
    });

    it('can retrieve json', () => {
      heroku.get('/users/janet/apps')
        .reply(200, APPS_FIVE);
      
      return AppCommand.run(['-u', 'janet', '-j'])
        .then((results) => {
          const expected = '[\n  "app_name_0",\n  "app_name_1",\n  "app_name_2",\n  "app_name_3",\n  "app_name_4"\n]\n';
          expect(cli.stdout).to.equal(expected);
          
          expect(results).to.be.ok;
          expect(Array.isArray(results)).to.be.true;
          expect(results.length).to.equal(5);

          const result0 = results[0];
          expect(result0).to.equal('app_name_0');
  
          return Promise.resolve(true);
        });
    });

    it('retrieves apps if there are is only one', () => {
      heroku.get('/users/janet/apps')
        .reply(200, APPS_SINGLE);
      
      return AppCommand.run(['-u', 'janet'])
        .then((results) => {
          const expected = 'app_name_0\n';
          expect(cli.stdout).to.equal(expected);
          
          expect(results).to.be.ok;
          expect(Array.isArray(results)).to.be.true;
          expect(results.length).to.equal(1);

          const result0 = results[0];
          expect(result0).to.equal('app_name_0');
  
          return Promise.resolve(true);
        });
    });

    it('retrieves no apps if there arent any', () => {
      heroku.get('/users/janet/apps')
        .reply(200, APPS_EMPTY);
      
      return AppCommand.run(['-u', 'janet'])
        .then((results) => {
          const expected = '\n';
          expect(cli.stdout).to.equal(expected);
          
          expect(results).to.be.ok;
          expect(Array.isArray(results)).to.be.true;
          expect(results.length).to.equal(0);
  
          return Promise.resolve(true);
        });
    });
  });
});
