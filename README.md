# hof-behaviour-summary-page

HOF behaviour for showing summary pages

The behaviour mixin will create a set of "locals" data which is compatible with [the `confirm` view from `hof-template-partials`](https://github.com/UKHomeOfficeForms/hof-template-partials/blob/master/views/confirm.html).

## Usage

If no sections config is passed, then the mixin will create a section for each step that has fields, and a row within each section for each field on that step.

```js
'/confirm': {
  behaviours: require('hof-behaviour-summary-page'),
  ...
}
```


Alternatively, sections can be defined manually as follows:

```js
'/confirm': {
  behaviours: require('hof-behaviour-summary-page'),
  sections: {
    'museum-details': [
      'name',
      {
        field: 'exhibit-addresses',
        parse: (value) => value.map(a => a.address),
        step: '/exhibit-add-another-address'
      }
    ],
    'contact': [
      'contact-name',
      'contact-email',
      'contact-phone',
      {
        field: 'contact-address',
        step: '/contact-address'
      }
    ]
  },
  ...
}
```

## Configuration

The `sections` configuration should be a map of arrays, where the entries in the array are the fields that should be shown within that section.

### Field configuration

Fields can be defined as simple strings of the field key, in which case all default configuration will be used.

Alternatively, a field can be passed as an object with a `field` property defining the field key, and any additional properties as follows:

* `step` - `String` defines the step which the user is returned to to edit the field value. By default this is the first step in the form's steps configuration which contains the field.
* `parse` - `Function` can parse the value for the field from the session into a value for display.
* `derivation` - `Object` allows for a new derived field based on a combination of other fields in the form. Note that
  if both `derivation` and `parse` are specified then parse will be applied to the result of derivation. E.G. 
  ```javascript
     derivation: {
       fromFields: ['field-one', 'field-two'],
       combiner: (values) => values.map(it => Number(it)).reduce((a, b) => a + b, 0) 
     }
  ```

## Translations

The content for section headings and field labels will be loaded from translation files based on the keys.

### Section headings

Translations for section headings are looked for in the following order:

* `pages.confirm.sections.${key}.header`
* `pages.${key}.header`

### Field labels

Translations for field labels are looked for in the following order:

* `pages.confirm.fields.${key}.label`
* `fields.${key}.label`
* `fields.${key}.legend`
