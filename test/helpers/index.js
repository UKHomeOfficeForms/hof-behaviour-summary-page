'use strict';

const reqres = require('reqres');
const Model = require('hof-model');

global.expect = require('chai').expect;

global.request = (obj) => {
  return reqres.req(Object.assign({
    translate: (a) => a,
    sessionModel: new Model()
  }, obj));
};
global.response = reqres.res;
