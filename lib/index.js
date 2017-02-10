'use strict';

const _ = require('lodash');
const BaseController = require('hof-controllers').base;

module.exports = class ConfirmController extends BaseController {

  parseSections(req) {
    const settings = req.form.options;
    const sections = this.getSectionSettings(settings);
    return Object.keys(sections)
      .map(section => {
        const fields = sections[section] || [];
        return {
          section: req.translate([
            `pages.confirm.sections.${section}.header`,
            `pages.${section}.header`
          ]),
          fields: _.flatten(fields.map(field => this.getFieldData(field, req))).filter(f => f.value)
        };
      })
      .filter(section => section.fields.length);
  }

  getSectionSettings(settings) {
    if (settings.sections) {
      return settings.sections;
    }
    return Object.keys(settings.steps).reduce((map, key) => {
      const fields = settings.steps[key].fields;
      if (fields) {
        map[key.replace(/^\//, '')] = fields;
      }
      return map;
    }, {});
  }

  getStepForField(key, steps) {
    return Object.keys(steps).filter(step => {
      return steps[step].fields && steps[step].fields.indexOf(key) > -1;
    })[0];
  }

  getFieldData(key, req) {
    const settings = req.form.options;
    if (typeof key === 'string') {
      return {
        label: req.translate([
          `pages.confirm.fields.${key}.label`,
          `fields.${key}.label`,
          `fields.${key}.legend`
        ]),
        value: req.sessionModel.get(key) || settings.nullValue,
        step: this.getStepForField(key, settings.steps),
        field: key
      };
    } else if (typeof key.field === 'string') {
      const obj = Object.assign(this.getFieldData(key.field, req), key);
      if (typeof key.parse === 'function') {
        obj.value = key.parse(obj.value);
      }
      return obj;
    }
    return {};
  }

  locals(req, res) {
    return Object.assign({}, super.locals(req, res), {
      rows: this.parseSections(req)
    });
  }

};
