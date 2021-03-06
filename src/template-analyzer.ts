import * as ESTree from 'estree';
import * as parse5 from 'parse5';
import treeAdapter = require('parse5-htmlparser2-tree-adapter');
import {templateExpressionToHtml, getExpressionPlaceholder} from './util';

export interface Visitor {
  enter: (node: treeAdapter.Node, parent: treeAdapter.Node | null) => void;
  exit: (node: treeAdapter.Node, parent: treeAdapter.Node | null) => void;
  enterElement: (
    node: treeAdapter.Element,
    parent: treeAdapter.Node | null
  ) => void;
  enterDocumentFragment: (
    node: treeAdapter.DocumentFragment,
    parent: treeAdapter.Node | null
  ) => void;
  enterCommentNode: (
    node: treeAdapter.CommentNode,
    parent: treeAdapter.Node | null
  ) => void;
  enterTextNode: (
    node: treeAdapter.TextNode,
    parent: treeAdapter.Node | null
  ) => void;
}

export interface ParseError extends parse5.Location {
  code: string;
}

type ParserOptionsWithError = parse5.ParserOptions & {
  onParseError?: (err: ParseError) => void;
};

const analyzerCache = new WeakMap<
  ESTree.TaggedTemplateExpression,
  TemplateAnalyzer
>();

/**
 * Analyzes a given template expression for traversing its contained
 * HTML tree.
 */
export class TemplateAnalyzer {
  public errors: ReadonlyArray<ParseError> = [];
  protected _node: ESTree.TaggedTemplateExpression;
  protected _ast: treeAdapter.DocumentFragment;

  /**
   * Create an analyzer instance for a given node
   *
   * @param {ESTree.TaggedTemplateExpression} node Node to use
   * @return {!TemplateAnalyzer}
   */
  public static create(
    node: ESTree.TaggedTemplateExpression
  ): TemplateAnalyzer {
    let cached = analyzerCache.get(node);
    if (!cached) {
      cached = new TemplateAnalyzer(node);
      analyzerCache.set(node, cached);
    }
    return cached;
  }

  /**
   * Constructor
   *
   * @param {ESTree.TaggedTemplateExpression} node Node to analyze
   */
  public constructor(node: ESTree.TaggedTemplateExpression) {
    this._node = node;

    const html = templateExpressionToHtml(node);

    const opts: ParserOptionsWithError = {
      treeAdapter: treeAdapter,
      sourceCodeLocationInfo: true,
      onParseError: (err): void => {
        (this.errors as ParseError[]).push(err);
      }
    };

    this._ast = parse5.parseFragment(
      html,
      opts
    ) as treeAdapter.DocumentFragment;
  }

  /**
   * Returns the ESTree location equivalent of a given parsed location.
   *
   * @param {treeAdapter.Node} node Node to retrieve location of
   * @return {?ESTree.SourceLocation}
   */
  public getLocationFor(
    node: treeAdapter.Node
  ): ESTree.SourceLocation | null | undefined {
    if (treeAdapter.isElementNode(node)) {
      const loc = (node as treeAdapter.Element).sourceCodeLocation;

      if (loc) {
        return this.resolveLocation(loc.startTag);
      }
    } else if (
      treeAdapter.isCommentNode(node) ||
      treeAdapter.isTextNode(node)
    ) {
      const loc = (node as treeAdapter.CommentNode | treeAdapter.TextNode)
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
  public getLocationForAttribute(
    element: treeAdapter.Element,
    attr: string
  ): ESTree.SourceLocation | null | undefined {
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
  public resolveLocation(
    loc: parse5.Location
  ): ESTree.SourceLocation | null | undefined {
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
  public traverse(visitor: Partial<Visitor>): void {
    const visit = (
      node: treeAdapter.Node,
      parent: treeAdapter.Node | null
    ): void => {
      if (!node) {
        return;
      }

      if (visitor.enter) {
        visitor.enter(node, parent);
      }

      if (node.type === 'root') {
        if (visitor.enterDocumentFragment) {
          visitor.enterDocumentFragment(
            node as treeAdapter.DocumentFragment,
            parent
          );
        }
      } else if (treeAdapter.isCommentNode(node)) {
        if (visitor.enterCommentNode) {
          visitor.enterCommentNode(node as treeAdapter.CommentNode, parent);
        }
      } else if (treeAdapter.isTextNode(node)) {
        if (visitor.enterTextNode) {
          visitor.enterTextNode(node as treeAdapter.TextNode, parent);
        }
      } else if (treeAdapter.isElementNode(node)) {
        if (visitor.enterElement) {
          visitor.enterElement(node as treeAdapter.Element, parent);
        }
      }

      if (treeAdapter.isElementNode(node) || node.type === 'root') {
        const children = (node as treeAdapter.ParentNode).childNodes;

        if (children && children.length > 0) {
          children.forEach(
            (child): void => {
              visit(child, node);
            }
          );
        }
      }

      if (visitor.exit) {
        visitor.exit(node, parent);
      }
    };

    visit(this._ast, null);
  }
}
