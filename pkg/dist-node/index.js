'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const config = {
  plugins: ['lit'],
  rules: {
    'lit/no-duplicate-template-bindings': 'error',
    'lit/no-legacy-template-syntax': 'error',
    'lit/attribute-value-entities': 'error',
    'lit/binding-positions': 'error',
    'lit/no-property-change-update': 'error',
    'lit/no-invalid-html': 'error'
  }
};

const requireIndex = require('requireindex');

const rules = requireIndex(`${__dirname}/rules`);
const configs = {
  'recommended': config
};

exports.rules = rules;
exports.configs = configs;
