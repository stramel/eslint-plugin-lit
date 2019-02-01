import * as parse5 from 'parse5';
import * as treeAdapter from 'parse5-htmlparser2-tree-adapter';
import { templateExpressionToHtml, getExpressionPlaceholder } from './util';
const analyzerCache = new WeakMap();
/**
 * Analyzes a given template expression for traversing its contained
 * HTML tree.
 */
export class TemplateAnalyzer {
    /**
     * Constructor
     *
     * @param {ESTree.TaggedTemplateExpression} node Node to analyze
     */
    constructor(node) {
        this.errors = [];
        this._node = node;
        const html = templateExpressionToHtml(node);
        const opts = {
            treeAdapter: treeAdapter,
            sourceCodeLocationInfo: true,
            onParseError: (err) => {
                this.errors.push(err);
            }
        };
        this._ast =
            parse5.parseFragment(html, opts);
    }
    /**
     * Create an analyzer instance for a given node
     *
     * @param {ESTree.TaggedTemplateExpression} node Node to use
     * @return {!TemplateAnalyzer}
     */
    static create(node) {
        let cached = analyzerCache.get(node);
        if (!cached) {
            cached = new TemplateAnalyzer(node);
            analyzerCache.set(node, cached);
        }
        return cached;
    }
    /**
     * Returns the ESTree location equivalent of a given parsed location.
     *
     * @param {treeAdapter.Node} node Node to retrieve location of
     * @return {?ESTree.SourceLocation}
     */
    getLocationFor(node) {
        if (treeAdapter.isElementNode(node)) {
            const loc = node.sourceCodeLocation;
            if (loc) {
                return this.resolveLocation(loc.startTag);
            }
        }
        else if (treeAdapter.isCommentNode(node) ||
            treeAdapter.isTextNode(node)) {
            const loc = node
                .sourceCodeLocation;
            if (loc) {
                return this.resolveLocation(loc);
            }
        }
        return this._node.loc;
    }
    /**
     * Returns the ESTree location equivalent of a given attribute
     *
     * @param {treeAdapter.Element} element Element which owns this attribute
     * @param {string} attr Attribute name to retrieve
     * @return {?ESTree.SourceLocation}
     */
    getLocationForAttribute(element, attr) {
        if (!element.sourceCodeLocation) {
            return null;
        }
        const loc = element.sourceCodeLocation.startTag.attrs[attr];
        return loc ? this.resolveLocation(loc) : null;
    }
    /**
     * Resolves a Parse5 location into an ESTree location
     *
     * @param {parse5.Location} loc Location to convert
     * @return {ESTree.SourceLocation}
     */
    resolveLocation(loc) {
        let offset = 0;
        for (const quasi of this._node.quasi.quasis) {
            const placeholder = getExpressionPlaceholder(this._node, quasi);
            offset += quasi.value.raw.length + placeholder.length;
            if (loc.startOffset < offset) {
                return quasi.loc;
            }
        }
        return null;
    }
    /**
     * Traverse the inner HTML tree with a given visitor
     *
     * @param {Visitor} visitor Visitor to apply
     * @return {void}
     */
    traverse(visitor) {
        const visit = (node, parent) => {
            if (!node) {
                return;
            }
            if (visitor.enter) {
                visitor.enter(node, parent);
            }
            if (node.type === 'root') {
                if (visitor.enterDocumentFragment) {
                    visitor.enterDocumentFragment(node, parent);
                }
            }
            else if (treeAdapter.isCommentNode(node)) {
                if (visitor.enterCommentNode) {
                    visitor.enterCommentNode(node, parent);
                }
            }
            else if (treeAdapter.isTextNode(node)) {
                if (visitor.enterTextNode) {
                    visitor.enterTextNode(node, parent);
                }
            }
            else if (treeAdapter.isElementNode(node)) {
                if (visitor.enterElement) {
                    visitor.enterElement(node, parent);
                }
            }
            if (treeAdapter.isElementNode(node) || node.type === 'root') {
                const children = node.childNodes;
                if (children && children.length > 0) {
                    children.forEach((child) => {
                        visit(child, node);
                    });
                }
            }
            if (visitor.exit) {
                visitor.exit(node, parent);
            }
        };
        visit(this._ast, null);
    }
}
