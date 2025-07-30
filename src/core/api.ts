import { parse, generate, traverse, findNodes, NodePath, ASTNode, Program } from 'bash-traverse';

/**
 * jscodeshift-like API for bash script transformations
 * Provides a familiar interface similar to jscodeshift but for bash scripts
 */
export class BashCodeshiftAPI {
  private ast: Program;
  private source: string;

  constructor(source: string) {
    this.source = source;
    this.ast = parse(source);
  }

  /**
   * Find all nodes of a specific type
   */
  find(nodeType: string, filter?: (node: ASTNode) => boolean): NodePath[] {
    const results: NodePath[] = [];

    traverse(this.ast, {
      [nodeType](path: NodePath) {
        if (!filter || filter(path.node)) {
          results.push(path);
        }
      }
    });

    return results;
  }

  /**
   * Find all commands with a specific name
   */
  findCommands(name: string): NodePath[] {
    return this.find('Command', (node: any) => node.name.text === name);
  }

  /**
   * Find all variable assignments with a specific name
   */
  findVariables(name: string): NodePath[] {
    return this.find('VariableAssignment', (node: any) => node.name.text === name);
  }

  /**
   * Find all function definitions with a specific name
   */
  findFunctions(name: string): NodePath[] {
    return this.find('FunctionDefinition', (node: any) => node.name.text === name);
  }

  /**
   * Filter a collection of NodePaths
   */
  filter(collection: NodePath[], predicate: (path: NodePath) => boolean): NodePath[] {
    return collection.filter(predicate);
  }

  /**
   * Execute a callback for each NodePath in a collection
   */
  forEach(collection: NodePath[], callback: (path: NodePath) => void): void {
    collection.forEach(callback);
  }

  /**
   * Map a collection of NodePaths to a new array
   */
  map<T>(collection: NodePath[], callback: (path: NodePath) => T): T[] {
    return collection.map(callback);
  }

  /**
   * Get the size of a collection
   */
  size(collection: NodePath[]): number {
    return collection.length;
  }

  /**
   * Generate source code from the AST
   */
  toSource(options?: { comments?: boolean; compact?: boolean; indent?: string }): string {
    return generate(this.ast, {
      comments: options?.comments ?? true,
      compact: options?.compact ?? false,
      indent: options?.indent ?? '  ',
      lineTerminator: '\n'
    });
  }

  /**
   * Get the underlying AST
   */
  getAST(): Program {
    return this.ast;
  }

  // Node constructors (similar to jscodeshift)
  Command(props: { name: string; arguments?: string[]; redirects?: any[] }): ASTNode {
    return {
      type: 'Command',
      name: { type: 'Word', text: props.name },
      arguments: (props.arguments || []).map(arg => ({ type: 'Word', text: arg })),
      redirects: props.redirects || []
    };
  }

  VariableAssignment(props: { name: string; value: string }): ASTNode {
    return {
      type: 'VariableAssignment',
      name: { type: 'Word', text: props.name },
      value: { type: 'Word', text: props.value }
    };
  }

  FunctionDefinition(props: { name: string; body: ASTNode[] }): ASTNode {
    return {
      type: 'FunctionDefinition',
      name: { type: 'Word', text: props.name },
      body: props.body
    };
  }

  IfStatement(props: { condition: ASTNode; thenBody: ASTNode[]; elseBody?: ASTNode[] }): ASTNode {
    return {
      type: 'IfStatement',
      condition: props.condition,
      thenBody: props.thenBody,
      elseBody: props.elseBody,
      elifClauses: []
    };
  }

  ForStatement(props: { variable: string; wordlist?: string[]; body: ASTNode[] }): ASTNode {
    return {
      type: 'ForStatement',
      variable: { type: 'Word', text: props.variable },
      wordlist: (props.wordlist || []).map(word => ({ type: 'Word', text: word })),
      body: props.body
    };
  }

  WhileStatement(props: { condition: ASTNode; body: ASTNode[] }): ASTNode {
    return {
      type: 'WhileStatement',
      condition: props.condition,
      body: props.body
    };
  }

  Pipeline(props: { commands: ASTNode[]; negated?: boolean }): ASTNode {
    return {
      type: 'Pipeline',
      commands: props.commands,
      negated: props.negated || false
    };
  }

  Comment(props: { value: string; leading?: boolean }): ASTNode {
    return {
      type: 'Comment',
      value: props.value,
      leading: props.leading !== false
    };
  }
}

/**
 * Create a bashcodeshift API instance
 */
export function b(source: string): BashCodeshiftAPI {
  return new BashCodeshiftAPI(source);
}