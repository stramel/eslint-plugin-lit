/**
 * @fileoverview Detects usages of the `value` attribute
 * @author James Garbutt <htttps://github.com/43081j>
 */
import { TemplateAnalyzer } from '../template-analyzer';
import { isExpressionPlaceholder } from '../util';
//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
const rule = {
    meta: {
        docs: {
            description: 'Detects usages of the `value` attribute where the ' +
                'equivalent property should be used instead',
            category: 'Best Practices',
            url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/no-value-attribute.md'
        },
        messages: {
            preferProperty: 'The `value` attribute only defines the initial value ' +
                'rather than permanently binding; you should set the `value` ' +
                'property instead via `.value`'
        }
    },
    create(context) {
        // variables should be defined here
        const warnedTags = ['input'];
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
                    analyzer.traverse({
                        enterElement: (element) => {
                            if (warnedTags.includes(element.tagName) &&
                                ('value' in element.attribs) &&
                                isExpressionPlaceholder(element.attribs['value'])) {
                                const loc = analyzer.getLocationForAttribute(element, 'value');
                                if (loc) {
                                    context.report({
                                        loc: loc,
                                        messageId: 'preferProperty'
                                    });
                                }
                            }
                        }
                    });
                }
            }
        };
    }
};
export default rule;
