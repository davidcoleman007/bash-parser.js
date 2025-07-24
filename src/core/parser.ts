import Parser from 'tree-sitter';
import Bash from 'tree-sitter-bash';
import {
  ProgramNode,
  CommandNode,
  VariableNode,
  ConditionalNode,
  LoopNode,
  FunctionNode,
  PipelineNode,
  Location
} from '../types';

/**
 * Bash AST Parser using tree-sitter
 */
export class BashParser {
  private parser: any;

  constructor() {
    this.parser = new Parser();
    this.parser.setLanguage(Bash);
  }

  /**
   * Parse bash source code into AST
   * @param source - Bash source code
   * @returns AST object
   */
  parse(source: string): ProgramNode {
    const tree = this.parser.parse(source);
    return this.convertToJSCodeshiftAST(tree.rootNode, source);
  }

  /**
   * Convert tree-sitter AST to jscodeshift-compatible AST
   * @param node - Tree-sitter node
   * @param source - Original source code
   * @returns JSCodeshift AST
   */
  private convertToJSCodeshiftAST(node: any, source: string): ProgramNode {
    const ast: ProgramNode = {
      type: 'Program',
      body: [],
      sourceType: 'script',
      loc: this.getLocation(node)
    };

    // Convert tree-sitter nodes to jscodeshift nodes
    this.walkNode(node, ast.body, source);

    return ast;
  }

  /**
   * Walk through tree-sitter nodes and convert them
   * @param node - Tree-sitter node
   * @param body - AST body array
   * @param source - Original source code
   */
  private walkNode(node: any, body: any[], source: string): void {
    switch (node.type) {
      case 'command':
        body.push(this.convertCommand(node, source));
        break;
      case 'variable_assignment':
        body.push(this.convertVariableAssignment(node, source));
        break;
      case 'if_statement':
        body.push(this.convertIfStatement(node, source));
        break;
      case 'for_statement':
        body.push(this.convertForStatement(node, source));
        break;
      case 'while_statement':
        body.push(this.convertWhileStatement(node, source));
        break;
      case 'function_definition':
        body.push(this.convertFunctionDefinition(node, source));
        break;
      case 'pipeline':
        body.push(this.convertPipeline(node, source));
        break;
      default:
        // Handle other node types
        if (node.children) {
          node.children.forEach((child: any) => this.walkNode(child, body, source));
        }
    }
  }

  /**
   * Convert command node
   * @param node - Command node
   * @param source - Source code
   * @returns Command AST node
   */
  private convertCommand(node: any, source: string): CommandNode {
    const commandNode: CommandNode = {
      type: 'Command',
      name: '',
      arguments: [],
      loc: this.getLocation(node)
    };

    // Extract command name and arguments
    node.children.forEach((child: any) => {
      if (child.type === 'command_name') {
        commandNode.name = this.getNodeText(child, source);
      } else if (child.type === 'argument') {
        commandNode.arguments.push(this.getNodeText(child, source));
      }
    });

    return commandNode;
  }

  /**
   * Convert variable assignment node
   * @param node - Variable assignment node
   * @param source - Source code
   * @returns Variable AST node
   */
  private convertVariableAssignment(node: any, source: string): VariableNode {
    return {
      type: 'Variable',
      name: this.getNodeText(node.children[0], source),
      value: this.getNodeText(node.children[1], source),
      loc: this.getLocation(node)
    };
  }

  /**
   * Convert if statement node
   * @param node - If statement node
   * @param source - Source code
   * @returns Conditional AST node
   */
  private convertIfStatement(node: any, source: string): ConditionalNode {
    return {
      type: 'Conditional',
      condition: this.getNodeText(node.children[1], source),
      consequent: this.extractBody(node.children[2], source),
      alternate: node.children[3] ? this.extractBody(node.children[3], source) : null,
      loc: this.getLocation(node)
    };
  }

  /**
   * Convert for statement node
   * @param node - For statement node
   * @param source - Source code
   * @returns Loop AST node
   */
  private convertForStatement(node: any, source: string): LoopNode {
    return {
      type: 'Loop',
      kind: 'for',
      variable: this.getNodeText(node.children[1], source),
      body: this.extractBody(node.children[2], source),
      loc: this.getLocation(node)
    };
  }

  /**
   * Convert while statement node
   * @param node - While statement node
   * @param source - Source code
   * @returns Loop AST node
   */
  private convertWhileStatement(node: any, source: string): LoopNode {
    return {
      type: 'Loop',
      kind: 'while',
      condition: this.getNodeText(node.children[1], source),
      body: this.extractBody(node.children[2], source),
      loc: this.getLocation(node)
    };
  }

  /**
   * Convert function definition node
   * @param node - Function definition node
   * @param source - Source code
   * @returns Function AST node
   */
  private convertFunctionDefinition(node: any, source: string): FunctionNode {
    return {
      type: 'Function',
      name: this.getNodeText(node.children[1], source),
      body: this.extractBody(node.children[2], source),
      loc: this.getLocation(node)
    };
  }

  /**
   * Convert pipeline node
   * @param node - Pipeline node
   * @param source - Source code
   * @returns Pipeline AST node
   */
  private convertPipeline(node: any, source: string): PipelineNode {
    return {
      type: 'Pipeline',
      commands: node.children
        .filter((child: any) => child.type === 'command')
        .map((child: any) => this.convertCommand(child, source)),
      loc: this.getLocation(node)
    };
  }

  /**
   * Extract body from a node
   * @param node - Node containing body
   * @param source - Source code
   * @returns Body AST nodes
   */
  private extractBody(node: any, source: string): any[] {
    const body: any[] = [];
    if (node.children) {
      node.children.forEach((child: any) => this.walkNode(child, body, source));
    }
    return body;
  }

  /**
   * Get location information for a node
   * @param node - Tree-sitter node
   * @returns Location object
   */
  private getLocation(node: any): Location {
    return {
      start: { line: node.startPosition.row, column: node.startPosition.column },
      end: { line: node.endPosition.row, column: node.endPosition.column }
    };
  }

  /**
   * Get text content of a node
   * @param node - Tree-sitter node
   * @param source - Source code
   * @returns Node text
   */
  private getNodeText(node: any, source: string): string {
    return source.substring(node.startIndex, node.endIndex);
  }
}