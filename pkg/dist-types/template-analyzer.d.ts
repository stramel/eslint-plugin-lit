import * as ESTree from 'estree';
import * as parse5 from 'parse5';
import * as treeAdapter from 'parse5-htmlparser2-tree-adapter';
export interface Visitor {
    enter: (node: treeAdapter.Node, parent: treeAdapter.Node | null) => void;
    exit: (node: treeAdapter.Node, parent: treeAdapter.Node | null) => void;
    enterElement: (node: treeAdapter.Element, parent: treeAdapter.Node | null) => void;
    enterDocumentFragment: (node: treeAdapter.DocumentFragment, parent: treeAdapter.Node | null) => void;
    enterCommentNode: (node: treeAdapter.CommentNode, parent: treeAdapter.Node | null) => void;
    enterTextNode: (node: treeAdapter.TextNode, parent: treeAdapter.Node | null) => void;
}
export interface ParseError extends parse5.Location {
    code: string;
}
/**
 * Analyzes a given template expression for traversing its contained
 * HTML tree.
 */
export declare class TemplateAnalyzer {
    errors: ReadonlyArray<ParseError>;
    protected _node: ESTree.TaggedTemplateExpression;
    protected _ast: treeAdapter.DocumentFragment;
    /**
     * Create an analyzer instance for a given node
     *
     * @param {ESTree.TaggedTemplateExpression} node Node to use
     * @return {!TemplateAnalyzer}
     */
    static create(node: ESTree.TaggedTemplateExpression): TemplateAnalyzer;
    /**
     * Constructor
     *
     * @param {ESTree.TaggedTemplateExpression} node Node to analyze
     */
    constructor(node: ESTree.TaggedTemplateExpression);
    /**
     * Returns the ESTree location equivalent of a given parsed location.
     *
     * @param {treeAdapter.Node} node Node to retrieve location of
     * @return {?ESTree.SourceLocation}
     */
    getLocationFor(node: treeAdapter.Node): ESTree.SourceLocation | null | undefined;
    /**
     * Returns the ESTree location equivalent of a given attribute
     *
     * @param {treeAdapter.Element} element Element which owns this attribute
     * @param {string} attr Attribute name to retrieve
     * @return {?ESTree.SourceLocation}
     */
    getLocationForAttribute(element: treeAdapter.Element, attr: string): ESTree.SourceLocation | null | undefined;
    /**
     * Resolves a Parse5 location into an ESTree location
     *
     * @param {parse5.Location} loc Location to convert
     * @return {ESTree.SourceLocation}
     */
    resolveLocation(loc: parse5.Location): ESTree.SourceLocation | null | undefined;
    /**
     * Traverse the inner HTML tree with a given visitor
     *
     * @param {Visitor} visitor Visitor to apply
     * @return {void}
     */
    traverse(visitor: Partial<Visitor>): void;
}
