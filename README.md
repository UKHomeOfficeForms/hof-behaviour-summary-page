# hof-confirm-controller
HOF Controller for showing summary pages

## Usage

```js
'/confirm': {
  controller: require('hof-form-controller'),
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
  }
}
```


