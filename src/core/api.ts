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

  /**
   * Insert a node after the current node in the AST
   * This works at the statement level, not the command level
   */
  insertAfter(path: NodePath, node: ASTNode): void {
    if (!path.parent || path.parentKey === null || path.parentIndex === null) {
      throw new Error('Cannot insert after node without parent context');
    }

    const parent = path.parent.node as any;
    const parentKey = path.parentKey;
    const parentIndex = path.parentIndex;

    if (Array.isArray(parent[parentKey])) {
      // Insert into array (e.g., ast.body)
      parent[parentKey].splice(parentIndex + 1, 0, node);
    } else {
      throw new Error('Cannot insert after node in non-array parent');
    }
  }

  /**
   * Insert a node before the current node in the AST
   * This works at the statement level, not the command level
   */
  insertBefore(path: NodePath, node: ASTNode): void {
    if (!path.parent || path.parentKey === null || path.parentIndex === null) {
      throw new Error('Cannot insert before node without parent context');
    }

    const parent = path.parent.node as any;
    const parentKey = path.parentKey;
    const parentIndex = path.parentIndex;

    if (Array.isArray(parent[parentKey])) {
      // Insert into array (e.g., ast.body)
      parent[parentKey].splice(parentIndex, 0, node);
    } else {
      throw new Error('Cannot insert before node in non-array parent');
    }
  }

  /**
   * Find the statement containing a command
   */
  findStatementForCommand(commandPath: NodePath): NodePath | null {
    // Walk up the tree to find the statement that contains this command
    let current = commandPath;
    while (current.parent) {
      if (current.parent.node.type === 'Statement' ||
          current.parent.node.type === 'Program') {
        return current.parent;
      }
      current = current.parent;
    }
    return null;
  }

  /**
   * Create a newline node
   */
  createNewline(): ASTNode {
    return { type: 'Newline' };
  }

  /**
   * Create a command node with proper spacing
   */
  createCommand(name: string, ...args: string[]): ASTNode {
    const arguments_ = [];

    for (let i = 0; i < args.length; i++) {
      if (i > 0) {
        arguments_.push({ type: 'Space', value: ' ' });
      }
      arguments_.push({ type: 'Word', text: args[i] });
    }

    return {
      type: 'Command',
      name: { type: 'Word', text: name },
      arguments: arguments_.length > 0 ? [{ type: 'Space', value: ' ' }, ...arguments_] : [],
      redirects: []
    };
  }

  /**
   * Insert commands after a specific command with proper newlines
   * This is a convenience method that handles the AST manipulation correctly
   */
  insertCommandsAfter(commandPath: NodePath, commands: string[]): void {
    const ast = this.ast;

    // Find the command in the AST body
    let commandIndex = -1;

    for (let i = 0; i < ast.body.length; i++) {
      const node = ast.body[i];
      if (node.type === 'Command' && node === commandPath.node) {
        commandIndex = i;
        break;
      }
    }

    if (commandIndex === -1) {
      throw new Error('Could not find command in AST body');
    }

    // Find the next newline after the command
    let insertIndex = commandIndex + 1;
    while (insertIndex < ast.body.length && ast.body[insertIndex].type !== 'Newline') {
      insertIndex++;
    }

    // If we found a newline, insert after it; otherwise insert after the command
    if (insertIndex < ast.body.length && ast.body[insertIndex].type === 'Newline') {
      insertIndex++;
    }

    // Create command nodes
    const commandNodes = commands.map(command => {
      const parts = command.split(' ');
      const name = parts[0];
      const args = parts.slice(1);

      const arguments_ = [];
      for (let i = 0; i < args.length; i++) {
        if (i > 0) {
          arguments_.push({ type: 'Space', value: ' ' });
        }
        arguments_.push({ type: 'Word', text: args[i] });
      }

      return {
        type: 'Command',
        name: { type: 'Word', text: name },
        arguments: [
          { type: 'Space', value: ' ' },
          ...arguments_,
        ],
        redirects: [],
      };
    });

    // Insert commands with proper newlines
    commandNodes.forEach((command, index) => {
      // Insert a newline before each command (except the first one)
      if (index > 0) {
        const newline = { type: 'Newline' };
        ast.body.splice(insertIndex, 0, newline as any);
        insertIndex++;
      }

      // Insert the command
      ast.body.splice(insertIndex, 0, command as any);
      insertIndex++;
    });

    // Add a final newline after the last command
    const finalNewline = { type: 'Newline' };
    ast.body.splice(insertIndex, 0, finalNewline as any);
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