'use strict';

const mix = require('mixwith').mix;
const Base = require('hof-form-controller');
const Behaviour = require('../');

class Controller extends mix(Base).with(Behaviour) {}

describe('Summary Page Behaviour', () => {
  let controller;
  let req;
  let res;

  beforeEach((done) => {
    req = request();
    res = response();

    controller = new Controller({
      route: '/foo',
      steps: {
        '/': {

        },
        '/one': {
          fields: ['field-one']
        },
        '/two': {
          fields: ['field-two']
        },
        '/done': {}
      }
    });
    controller._configure(req, res, done);
  });

  it('extends hof-controllers.base class', () => {
    expect(controller).to.be.an.instanceOf(Base);
  });

  describe('locals', () => {

    beforeEach(() => {
      sinon.stub(Base.prototype, 'locals').returns({super: true});
    });
    afterEach(() => {
      Base.prototype.locals.restore();
    });

    it('includes locals set by the base class', () => {
      const result = controller.locals(req, res);
      expect(result.super).to.equal(true);
      expect(Base.prototype.locals).to.have.been.calledWithExactly(req, res);
    });

    it('sets rows property to an array', () => {
      const result = controller.locals(req, res);
      expect(result).to.have.property('rows');
      expect(result.rows).to.be.an('array');
    });

    it('maps the sections from settings onto rows with headers translated from the section key', () => {
      req.sessionModel.set({
        'field-one': 1,
        'field-two': 2
      });
      req.form.options.sections = {
        'section-one': ['field-one'],
        'section-two': ['field-two']
      };
      const result = controller.locals(req, res);
      expect(result.rows.length).to.equal(2);
      expect(result.rows[0]).to.have.a.property('section');
      expect(req.translate).to.have.been.calledWithExactly([
        'pages.confirm.sections.section-one.header',
        'pages.section-one.header'
      ]);
      expect(result.rows[1]).to.have.a.property('section');
      expect(req.translate).to.have.been.calledWithExactly([
        'pages.confirm.sections.section-two.header',
        'pages.section-two.header'
      ]);
    });

    it('maps the section fields onto a fields array for each section', () => {
      req.sessionModel.set({
        'field-one': 1,
        'field-two': 2
      });
      req.form.options.sections = {
        'section-one': ['field-one', 'field-two']
      };
      const result = controller.locals(req, res);
      expect(result.rows[0]).to.have.a.property('fields');
      expect(result.rows[0].fields).to.be.an('array');
      expect(result.rows[0].fields.length).to.equal(2);
      expect(result.rows[0].fields[0].field).to.equal('field-one');
      expect(result.rows[0].fields[1].field).to.equal('field-two');
    });

    it('ignores fields with no value set', () => {
      req.sessionModel.set({
        'field-one': 1
      });
      req.form.options.sections = {
        'section-one': ['field-one', 'field-two']
      };
      const result = controller.locals(req, res);
      expect(result.rows[0].fields.length).to.equal(1);
      expect(result.rows[0].fields[0].field).to.equal('field-one');
      expect(result.rows[0].fields[0].value).to.equal(1);
    });

    it('uses a nullValue for empty fields if defined', () => {
      req.sessionModel.set({
        'field-one': 1
      });
      req.form.options.nullValue = '-';
      req.form.options.sections = {
        'section-one': ['field-one', 'field-two']
      };
      const result = controller.locals(req, res);
      expect(result.rows[0].fields.length).to.equal(2);
      expect(result.rows[0].fields[0].value).to.equal(1);
      expect(result.rows[0].fields[1].value).to.equal('-');
    });

    it('calculates the step for each field based on steps config', () => {
      req.sessionModel.set({
        'field-one': 1,
        'field-two': 2,
        'field-three': 3
      });
      req.form.options.nullValue = '-';
      req.form.options.sections = {
        'section-one': ['field-one', 'field-two', 'field-three']
      };
      const result = controller.locals(req, res);
      expect(result.rows[0].fields[0].step).to.equal('/one');
      expect(result.rows[0].fields[1].step).to.equal('/two');
      expect(result.rows[0].fields[2].step).to.equal(undefined);
    });

    it('fields can be passed as an object with a field property', () => {
      req.sessionModel.set({
        'field-one': 1,
        'field-two': 2
      });
      req.form.options.sections = {
        'section-one': ['field-one', {field: 'field-two'}]
      };
      const result = controller.locals(req, res);
      expect(result.rows[0].fields.length).to.equal(2);
      expect(result.rows[0].fields[0].value).to.equal(1);
      expect(result.rows[0].fields[1].value).to.equal(2);
    });

    it('overrides step property with passed value if defined', () => {
      req.sessionModel.set({
        'field-one': 1,
        'field-two': 2,
        'field-three': 3
      });
      req.form.options.sections = {
        'section-one': ['field-one', 'field-two', {field: 'field-three', step: '/two'}]
      };
      const result = controller.locals(req, res);
      expect(result.rows[0].fields[2].step).to.equal('/two');
    });

    it('parses the value of a field if a parse function is passed', () => {
      req.sessionModel.set({
        'field-one': 1,
        'field-two': 2
      });
      req.form.options.sections = {
        'section-one': ['field-one', {field: 'field-two', parse: v => v + 1}]
      };
      const result = controller.locals(req, res);
      expect(result.rows[0].fields[1].value).to.equal(3);
    });

    it('ignore sections with no fields', () => {
      req.sessionModel.set({
        'field-one': 1
      });
      req.form.options.sections = {
        'section-one': ['field-one'],
        'section-two': ['field-two']
      };
      const result = controller.locals(req, res);
      expect(result.rows.length).to.equal(1);
    });

    it('uses steps configuration for sections if no section config is defined', () => {
      req.sessionModel.set({
        'field-one': 1,
        'field-two': 2
      });
      delete req.form.options.sections;
      const result = controller.locals(req, res);
      expect(result.rows.length).to.equal(2);
      expect(result.rows[0].fields.length).to.equal(1);
      expect(result.rows[0].fields[0].field).to.equal('field-one');
      expect(result.rows[1].fields.length).to.equal(1);
      expect(result.rows[1].fields[0].field).to.equal('field-two');
      expect(req.translate).to.have.been.calledWithExactly(['pages.confirm.sections.one.header', 'pages.one.header']);
      expect(req.translate).to.have.been.calledWithExactly(['pages.confirm.sections.two.header', 'pages.two.header']);
    });

    it('flattens fields if a custom implementation of `getFieldData` returns array for a field', () => {
      req.sessionModel.set({
        'field-one': 1
      });
      req.form.options.sections = {
        'section-one': ['field-one']
      };
      controller.getFieldData = () => {
        return [
          {
            label: 'one',
            value: 1
          },
          {
            label: 'two',
            value: 2
          }
        ];
      };
      const result = controller.locals(req, res);
      expect(result.rows[0].fields.length).to.equal(2);
      expect(result.rows[0].fields[0].label).to.equal('one');
      expect(result.rows[0].fields[1].label).to.equal('two');
    });

  });

});
