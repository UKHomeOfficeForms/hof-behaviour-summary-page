'use strict';

const Controller = require('../');

describe('Confirm Controller', () => {

  let controller;
  let req;
  let res;

  beforeEach((done) => {
    req = request();
    res = response();
    controller = new Controller({
      route: '/foo'
    });
    controller._configure(req, res, done);
  });

  describe('locals', () => {

    it('sets rows property to an array', () => {
      const result = controller.locals(req, res);
      expect(result).to.have.property('rows');
      expect(result.rows).to.be.an('array');
    });

  });

});
