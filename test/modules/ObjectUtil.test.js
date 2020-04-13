
/* eslint-disable no-unused-vars */
const chai = require('chai');
const {expect} = chai;

const mocha = require('mocha');
const {it, beforeEach, afterEach} = mocha;

const nock = require('nock');

const {test} = require('@oclif/test');

const cli = require('heroku-cli-util');
/* eslint-enable no-unused-vars */

const ObjectUtil = require('../../src/modules/ObjectUtil');

describe('ObjectUtils', () => {
  beforeEach(() => {
  });

  afterEach(() => {
  });

  describe('FindUnique finds unique values', () => {
    it('even when the array is blank', () => {
      let a = [];
      let expected = [];
      let result = ObjectUtil.findUnique((val) => val, a);
      expect(result).to.deep.equal(expected);
    });
    it('when there are only unique values', () => {
      let a = [1, 2, 3, 4, 5];
      let expected = [1, 2, 3, 4, 5];
      let result = ObjectUtil.findUnique((val) => val, a);
      expect(result).to.deep.equal(expected);
    });
    it('when there are duplicate values', () => {
      let a = [1, 2, 3, 4, 5, 3, 4, 5, 6, 7, 8, 7, 8];
      let expected = [1, 2, 3, 4, 5, 6, 7, 8];
      let result = ObjectUtil.findUnique((val) => val, a);
      expect(result).to.deep.equal(expected);
    });
  });
});
