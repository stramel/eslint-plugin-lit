# eslint-plugin-lit

[![npm version](https://img.shields.io/npm/v/eslint-plugin-lit.svg?style=flat)](https://npmjs.org/package/eslint-plugin-lit 'View this project on npm')
[![Build Status](https://travis-ci.org/43081j/eslint-plugin-lit.svg?branch=master)](https://travis-ci.org/43081j/eslint-plugin-lit)
[![Coverage Status](https://coveralls.io/repos/github/43081j/eslint-plugin-lit/badge.svg?branch=master)](https://coveralls.io/github/43081j/eslint-plugin-lit?branch=master)

[lit-html](https://github.com/polymer/lit-html) support for ESLint.

**Note:** experimental, may change quite a bit.

# Install

```
$ npm i -D eslint eslint-plugin-lit
```

# Usage

Add `lit` to the plugins section of your `.eslintrc` file:

```json
{
  "plugins": ["lit"]
}
```

Configure your rules like so:

```json
{
  "rules": {
    "lit/rule-name": "error"
  }
}
```

# Supported Rules

- [lit/no-duplicate-template-bindings](docs/rules/no-duplicate-template-bindings.md)
- [lit/no-legacy-template-syntax](docs/rules/no-legacy-template-syntax.md)
- [lit/no-template-bind](docs/rules/no-template-bind.md)
- [lit/no-template-map](docs/rules/no-template-map.md)
- [lit/no-useless-template-literals](docs/rules/no-useless-template-literals.md)
- [lit/attribute-value-entities](docs/rules/attribute-value-entities.md)
- [lit/binding-positions](docs/rules/binding-positions.md)
- [lit/no-property-change-update](docs/rules/no-property-change-update.md)
- [lit/no-invalid-html](docs/rules/no-invalid-html.md)
- [lit/no-value-attribute](docs/rules/no-value-attribute.md)
