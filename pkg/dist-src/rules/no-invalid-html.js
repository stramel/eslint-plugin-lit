/**
 * @fileoverview Disallows invalid HTML in templates
 * @author James Garbutt <htttps://github.com/43081j>
 */
import { TemplateAnalyzer } from '../template-analyzer';
//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
const rule = {
    meta: {
        docs: {
            description: 'Disallows invalid HTML in templates',
            category: 'Best Practices',
            url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/no-invalid-html.md'
        },
        messages: {
            parseError: 'Template contained invalid HTML syntax, error was: {{ err }}'
        }
    },
    create(context) {
        // variables should be defined here
        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------
        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------
        return {
            'TaggedTemplateExpression': (node) => {
                if (node.type === 'TaggedTemplateExpression' &&
                    node.tag.type === 'Identifier' &&
                    node.tag.name === 'html') {
                    const analyzer = TemplateAnalyzer.create(node);
                    for (const err of analyzer.errors) {
                        // Ignore these as the duplicate attributes rule handles them
                        if (err.code === 'duplicate-attribute') {
                            continue;
                        }
                        const loc = analyzer.resolveLocation(err);
                        if (loc) {
                            context.report({
                                loc: loc,
                                messageId: 'parseError',
                                data: { err: err.code }
                            });
                        }
                    }
                }
            }
        };
    }
};
export default rule;
