/**
 * @fileoverview Disallows invalid binding positions in templates
 * @author James Garbutt <htttps://github.com/43081j>
 */
//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
import rule from '../../rules/binding-positions';
import { RuleTester } from 'eslint';
//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------
const ruleTester = new RuleTester({
    parserOptions: {
        sourceType: 'module'
    }
});
ruleTester.run('binding-positions', rule, {
    valid: [
        { code: 'html`foo bar`' },
        { code: 'html`<x-foo attr=${expr}>`' },
        { code: 'html`<x-foo>`' }
    ],
    invalid: [
        {
            code: 'html`<x-foo ${expr}="foo">`',
            errors: [
                {
                    message: 'Bindings cannot be used in place of attribute names.',
                    line: 1,
                    column: 15
                }
            ]
        },
        {
            code: 'html`<${expr}>`',
            errors: [
                {
                    message: 'Bindings cannot be used in place of tag names.',
                    line: 1,
                    column: 9
                }
            ]
        },
        {
            code: 'html`<${expr} foo="bar">`',
            errors: [
                {
                    message: 'Bindings cannot be used in place of tag names.',
                    line: 1,
                    column: 9
                }
            ]
        },
        {
            code: 'html`<x-foo></${expr}>`',
            errors: [
                {
                    message: 'Bindings cannot be used in place of tag names.',
                    line: 1,
                    column: 17
                }
            ]
        }
    ]
});
