/**
 * @fileoverview Disallows arrow functions and `.bind` in templates
 * @author James Garbutt <htttps://github.com/43081j>
 */
//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
const rule = {
    meta: {
        docs: {
            description: 'Disallows arrow functions and `.bind` in templates',
            category: 'Best Practices',
            url: 'https://github.com/43081j/eslint-plugin-lit/blob/master/docs/rules/no-template-bind.md'
        },
        messages: {
            noBind: 'Arrow functions and `.bind` must not be used in templates, ' +
                'a method should be passed directly like `${this.myMethod}` as it ' +
                'will be bound automatically.'
        }
    },
    create(context) {
        // variables should be defined here
        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------
        /**
         * Determines whether a node is a disallowed expression
         * or not.
         *
         * @param {ESTree.Node} node
         * @return {boolean}
         */
        function isDisallowedExpr(node) {
            if (node.type === 'ArrowFunctionExpression' ||
                node.type === 'FunctionExpression') {
                return true;
            }
            if (node.type === 'CallExpression' &&
                node.callee.type === 'MemberExpression' &&
                node.callee.property.type === 'Identifier' &&
                node.callee.property.name === 'bind') {
                return true;
            }
            if (node.type === 'ConditionalExpression') {
                return isDisallowedExpr(node.test) ||
                    isDisallowedExpr(node.consequent) ||
                    isDisallowedExpr(node.alternate);
            }
            return false;
        }
        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------
        return {
            'TaggedTemplateExpression': (node) => {
                if (node.type === 'TaggedTemplateExpression' &&
                    node.tag.type === 'Identifier' &&
                    node.tag.name === 'html') {
                    for (const expr of node.quasi.expressions) {
                        if (isDisallowedExpr(expr)) {
                            context.report({
                                node: expr,
                                messageId: 'noBind'
                            });
                        }
                    }
                }
            }
        };
    }
};
export default rule;
