'use strict';

const BaseController = require('hof-controllers').base;

module.exports = class ConfirmController extends BaseController {

  parseSections(settings, data) {
    /*
    return data schema
    [
      {
        fields: [
          {
            label: '',
            value: '',
            step: '',
            field: ''
          }
        ],
        section: ''
      }
    ]
    */
    return [];
  }

  locals(req, res) {
    return Object.assign({}, super.locals(req, res), {
      rows: this.parseSections(req.form.options.sections, req.sessionModel.toJSON())
    });
  }

};
