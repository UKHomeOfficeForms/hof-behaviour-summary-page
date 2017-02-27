'use strict';

const _ = require('lodash');

const isTruthy = (model, field) => {
  field = typeof field === 'object' ? field.field : field;
  const value = model.get(field);
  return value !== '' && value !== null && value !== undefined;
};

const getValue = (value, field, translate) => {
  const key = `fields.${field}.options.${value}.label`;
  let result = translate(key);
  if (result === key) {
    result = value;
  }
  return result;
};

module.exports = SuperClass => class extends SuperClass {

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
          fields: _.flatten(fields.filter(field => isTruthy(req.sessionModel, field))
            .map(field => this.getFieldData(field, req)))
            .filter(f => f.value)
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
          `fields.${key}.summary`,
          `fields.${key}.label`,
          `fields.${key}.legend`
        ]),
        value: getValue(req.sessionModel.get(key), key, req.translate) || settings.nullValue,
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
