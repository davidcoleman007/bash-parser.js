# Bash-Traverse API Guide

A comprehensive guide to the bash-traverse library API for building generation utilities like bashcodeshift.

## Table of Contents

1. [Overview](#overview)
2. [Core API](#core-api)
3. [AST Node Types](#ast-node-types)
4. [Parsing](#parsing)
5. [Code Generation](#code-generation)
6. [AST Traversal](#ast-traversal)
7. [Plugin System](#plugin-system)
8. [Advanced Usage](#advanced-usage)
9. [Examples](#examples)

## Overview

Bash-traverse is a comprehensive library for parsing, analyzing, and generating Bash shell scripts. It provides a complete Abstract Syntax Tree (AST) representation of Bash code with full round-trip capabilities.

### Key Features

- **Complete Bash Parsing**: Supports all major Bash constructs including control structures, functions, pipelines, and more
- **AST Manipulation**: Rich API for traversing and modifying AST nodes
- **Code Generation**: Generate Bash code from AST with formatting control
- **Plugin System**: Extensible architecture for custom commands and transformations
- **Round-trip Fidelity**: Parse → Transform → Generate maintains code structure

## Core API

### Main Exports

```typescript
import {
  parse,
  generate,
  traverse,
  findNodes,
  findNode,
  hasNode,
  countNodes,
  transform,
  BashParser,
  BashLexer,
  PluginRegistry,
  PluginSDK
} from 'bash-traverse';
```

### Basic Usage

```typescript
// Parse Bash code into AST
const ast = parse('echo "Hello, World!"');

// Generate code from AST
const code = generate(ast);

// Round-trip validation
const ast2 = parse(code);
const code2 = generate(ast2);
// code === code2 (with normalization)
```

## AST Node Types

### Core Node Interface

All AST nodes extend the base `ASTNode` interface:

```typescript
interface ASTNode {
  type: string;
  loc?: SourceLocation;
  [key: string]: any;
}

interface SourceLocation {
  start: Position;
  end: Position;
  source?: string;
}

interface Position {
  line: number;
  column: number;
  offset: number;
}
```

### Program Structure

```typescript
interface Program extends ASTNode {
  type: 'Program';
  body: Statement[];
  comments: Comment[];
}
```

### Statement Types

The main statement types that can appear in a program:

```typescript
type Statement =
  | Command
  | Pipeline
  | TestExpression
  | IfStatement
  | ForStatement
  | WhileStatement
  | UntilStatement
  | CaseStatement
  | FunctionDefinition
  | Subshell
  | Comment
  | Shebang
  | NewlineStatement
  | SemicolonStatement
  | DoubleSemicolonStatement
  | SpaceStatement
  | VariableAssignment;
```

### Command Structure

```typescript
interface Command extends ASTNode {
  type: 'Command';
  name: Word;
  arguments: Word[];
  redirects: Redirect[];
  hereDocument?: HereDocument;
  prefixStatements?: Statement[];
  async?: boolean;
  leadingComments?: Comment[];
  trailingComments?: Comment[];
  hasSpaceBefore?: boolean;
  hasSpaceAfter?: boolean;
  indentation?: string;
}
```

### Control Structures

#### If Statement
```typescript
interface IfStatement extends ASTNode {
  type: 'IfStatement';
  condition: Statement;
  semicolonAfterCondition?: SemicolonStatement;
  thenBody: Statement[];
  elifClauses: ElifClause[];
  elseBody?: Statement[];
}
```

#### For Loop
```typescript
interface ForStatement extends ASTNode {
  type: 'ForStatement';
  variable: Word;
  wordlist?: Word[];
  semicolonAfterWordlist?: SemicolonStatement;
  body: Statement[];
}
```

#### While Loop
```typescript
interface WhileStatement extends ASTNode {
  type: 'WhileStatement';
  condition: TestExpression;
  semicolonAfterCondition?: SemicolonStatement;
  body: Statement[];
}
```

#### Case Statement
```typescript
interface CaseStatement extends ASTNode {
  type: 'CaseStatement';
  expression: ASTNode;
  clauses: CaseClause[];
}

interface CaseClause extends ASTNode {
  type: 'CaseClause';
  patterns: ASTNode[];
  statements: Statement[];
  clauseStart: number;
  clauseEnd: number;
}
```

### Word and Text Elements

```typescript
interface Word extends ASTNode {
  type: 'Word';
  text: string;
  quoted?: boolean;
  quoteType?: '"' | "'" | '`';
}

interface Comment extends ASTNode {
  type: 'Comment';
  value: string;
  leading: boolean;
}
```

### Test Expressions

```typescript
interface TestExpression extends ASTNode {
  type: 'TestExpression';
  elements: TestElement[];
  negated?: boolean;
  extended?: boolean; // true for [[ ... ]], false for [ ... ]
}

interface TestElement extends ASTNode {
  type: 'TestElement';
  operator?: Word;
  argument?: Word;
  isOperator: boolean;
}
```

## Parsing

### Basic Parsing

```typescript
import { parse, BashParser } from 'bash-traverse';

// Simple parsing
const ast = parse('echo "Hello, World!"');

// With plugins
const ast = parse('docker run -it ubuntu', [dockerPlugin]);

// Parser options
const ast = parse(source, plugins, {
  locations: true,
  comments: true,
  ranges: true,
  sourceType: 'script'
});
```

### Parser Class

For advanced usage, you can use the `BashParser` class directly:

```typescript
import { BashParser } from 'bash-traverse';

const parser = new BashParser([plugin1, plugin2]);
const ast = parser.parse(source);
```

### Parser Options

```typescript
interface ParserOptions {
  locations?: boolean;    // Include source location information
  comments?: boolean;     // Include comment nodes
  ranges?: boolean;       // Include range information
  sourceType?: 'script' | 'module';
}
```

## Code Generation

### Basic Generation

```typescript
import { generate } from 'bash-traverse';

const code = generate(ast);
```

### Generation Options

```typescript
interface GeneratorOptions {
  comments?: boolean;      // Include comments in output
  compact?: boolean;       // Minimize whitespace
  indent?: string;         // Indentation string (default: '  ')
  lineTerminator?: string; // Line ending (default: '\n')
}

const code = generate(ast, {
  comments: true,
  compact: false,
  indent: '    ',
  lineTerminator: '\n'
});
```

### Custom Generation

You can also use individual generators for specific node types:

```typescript
import { generateCommand, generateIfStatement } from 'bash-traverse/generators';

const commandCode = generateCommand(commandNode);
const ifCode = generateIfStatement(ifNode);
```

## AST Traversal

### Basic Traversal

```typescript
import { traverse } from 'bash-traverse';

traverse(ast, {
  Command(path) {
    console.log('Found command:', path.node.name.text);
  },

  IfStatement(path) {
    console.log('Found if statement');
  }
});
```

### NodePath API

The `NodePath` object provides methods for AST manipulation:

```typescript
interface NodePath<T = ASTNode> {
  node: T;
  parent: NodePath | null;
  parentKey: string | null;
  parentIndex: number | null;
  type: string;

  get(key: string): NodePath | null;
  getNode(key: string): ASTNode | null;
  isNodeType(type: string): boolean;
  replaceWith(node: ASTNode): void;
  insertBefore(node: ASTNode): void;
  insertAfter(node: ASTNode): void;
  remove(): void;
}
```

### Traversal Examples

#### Finding Nodes
```typescript
import { findNodes, findNode, hasNode, countNodes } from 'bash-traverse';

// Find all commands
const commands = findNodes(ast, 'Command');

// Find first if statement
const ifStatement = findNode(ast, 'IfStatement');

// Check if AST has functions
const hasFunctions = hasNode(ast, 'FunctionDefinition');

// Count variables
const variableCount = countNodes(ast, 'VariableAssignment');
```

#### Transforming AST
```typescript
import { transform } from 'bash-traverse';

const transformedAst = transform(ast, {
  Command(path) {
    // Add --verbose flag to all commands
    const command = path.node;
    if (command.arguments.length > 0) {
      command.arguments.unshift({
        type: 'Word',
        text: '--verbose'
      });
    }
  }
});
```

#### Complex Transformations
```typescript
traverse(ast, {
  IfStatement(path) {
    const ifNode = path.node;

    // Add logging to all if statements
    const logCommand = {
      type: 'Command',
      name: { type: 'Word', text: 'echo' },
      arguments: [
        { type: 'Word', text: 'Checking condition' }
      ]
    };

    ifNode.thenBody.unshift(logCommand);
  },

  FunctionDefinition(path) {
    const func = path.node;

    // Add function documentation
    const docComment = {
      type: 'Comment',
      value: `# Function: ${func.name.text}`,
      leading: true
    };

    func.leadingComments = func.leadingComments || [];
    func.leadingComments.push(docComment);
  }
});
```

## Plugin System

### Plugin Structure

```typescript
interface BashPlugin {
  name: string;
  version: string;
  description?: string;
  commands?: CustomCommandHandler[];
  visitors?: VisitorPlugin[];
  generators?: GeneratorPlugin[];
  dependencies?: string[];
}
```

### Creating Plugins

#### Using PluginSDK

```typescript
import { PluginSDK } from 'bash-traverse';

const sdk = new PluginSDK();

const myPlugin = {
  name: 'my-plugin',
  version: '1.0.0',

  commands: [
    sdk.createCommandHandler('my-command', {
      parse: (tokens, startIndex) => {
        // Parse custom command
        return { node: customNode, consumedTokens: 2 };
      },
      generate: (node) => {
        // Generate custom command
        return 'my-command --option';
      },
      validate: (node) => {
        // Validate custom command
        return { isValid: true, errors: [], warnings: [] };
      }
    })
  ],

  visitors: [
    sdk.createVisitor('my-visitor', {
      Command(path) {
        // Transform commands
      }
    })
  ],

  generators: [
    sdk.createGenerator('my-generator', {
      canHandle: (nodeType) => nodeType === 'CustomNode',
      generate: (node) => 'custom code'
    })
  ]
};
```

#### Custom Command Handler

```typescript
const customCommandHandler: CustomCommandHandler = {
  pattern: 'custom-command',
  priority: 10,

  parse: (tokens: Token[], startIndex: number) => {
    let consumedTokens = 0;
    const options: ASTNode[] = [];

    // Skip command name
    consumedTokens++;

    // Parse options
    while (startIndex + consumedTokens < tokens.length) {
      const token = tokens[startIndex + consumedTokens];
      if (token.type === 'WORD' && token.value.startsWith('-')) {
        options.push({
          type: 'Word',
          text: token.value,
          loc: token.loc
        });
        consumedTokens++;
      } else {
        break;
      }
    }

    const node: ASTNode = {
      type: 'CustomCommand',
      options
    };

    return { node, consumedTokens };
  },

  generate: (node: ASTNode) => {
    const customNode = node as any;
    let command = 'custom-command';

    customNode.options.forEach((opt: any) => {
      command += ` ${opt.text}`;
    });

    return command;
  }
};
```

### Plugin Registry

```typescript
import { PluginRegistry } from 'bash-traverse';

const registry = new PluginRegistry();

// Register plugins
registry.register(myPlugin);
registry.register(anotherPlugin);

// Get all plugins
const plugins = registry.getAllPlugins();

// Get specific plugin
const plugin = registry.getPlugin('my-plugin');

// Get command handlers
const handlers = registry.getCommandHandlers();
```

## Advanced Usage

### Lexer Access

For advanced token-level operations:

```typescript
import { BashLexer } from 'bash-traverse';

const lexer = new BashLexer('echo "Hello, World!"');
const tokens = lexer.tokenize();

// Work with individual tokens
tokens.forEach(token => {
  console.log(`${token.type}: ${token.value}`);
});
```

### Custom AST Node Types

You can extend the AST with custom node types:

```typescript
interface CustomNode extends ASTNode {
  type: 'CustomNode';
  customProperty: string;
  customValue: number;
}

// Create custom node
const customNode: CustomNode = {
  type: 'CustomNode',
  customProperty: 'value',
  customValue: 42
};
```

### Error Handling

```typescript
try {
  const ast = parse(source);
} catch (error) {
  if (error instanceof SyntaxError) {
    console.error('Parse error:', error.message);
    console.error('Location:', error.location);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Performance Optimization

For large scripts, consider:

```typescript
// Use compact parsing for large files
const ast = parse(source, plugins, { compact: true });

// Selective traversal
traverse(ast, {
  Command(path) {
    // Only process specific commands
    if (path.node.name.text === 'target-command') {
      // Process only this command
    }
  }
});
```

## Examples

### Building a Code Transformer

```typescript
import { parse, generate, traverse } from 'bash-traverse';

function transformScript(source: string): string {
  // Parse the script
  const ast = parse(source);

  // Apply transformations
  traverse(ast, {
    Command(path) {
      const command = path.node;

      // Add logging to all echo commands
      if (command.name.text === 'echo') {
        const logCommand = {
          type: 'Command',
          name: { type: 'Word', text: 'logger' },
          arguments: [
            { type: 'Word', text: 'INFO' },
            { type: 'Word', text: 'Echo command executed' }
          ]
        };

        // Insert logging before echo
        path.insertBefore(logCommand);
      }
    },

    IfStatement(path) {
      const ifNode = path.node;

      // Add error handling to if statements
      const errorCheck = {
        type: 'Command',
        name: { type: 'Word', text: 'echo' },
        arguments: [
          { type: 'Word', text: 'Error: condition failed' }
        ]
      };

      ifNode.elseBody = ifNode.elseBody || [];
      ifNode.elseBody.unshift(errorCheck);
    }
  });

  // Generate transformed code
  return generate(ast);
}
```

### Creating a Linter

```typescript
import { parse, traverse } from 'bash-traverse';

interface LintResult {
  errors: Array<{ message: string; line: number; column: number }>;
  warnings: Array<{ message: string; line: number; column: number }>;
}

function lintScript(source: string): LintResult {
  const ast = parse(source);
  const result: LintResult = { errors: [], warnings: [] };

  traverse(ast, {
    Command(path) {
      const command = path.node;

      // Check for dangerous commands
      const dangerousCommands = ['rm', 'chmod', 'chown'];
      if (dangerousCommands.includes(command.name.text)) {
        result.warnings.push({
          message: `Potentially dangerous command: ${command.name.text}`,
          line: command.loc?.start.line || 0,
          column: command.loc?.start.column || 0
        });
      }
    },

    FunctionDefinition(path) {
      const func = path.node;

      // Check for function naming conventions
      if (!/^[a-z_][a-z0-9_]*$/.test(func.name.text)) {
        result.errors.push({
          message: `Function name should be lowercase with underscores: ${func.name.text}`,
          line: func.loc?.start.line || 0,
          column: func.loc?.start.column || 0
        });
      }
    }
  });

  return result;
}
```

### Building a Code Analyzer

```typescript
import { parse, findNodes, countNodes } from 'bash-traverse';

interface ScriptAnalysis {
  totalCommands: number;
  functions: string[];
  controlStructures: {
    if: number;
    for: number;
    while: number;
    case: number;
  };
  variables: string[];
  complexity: number;
}

function analyzeScript(source: string): ScriptAnalysis {
  const ast = parse(source);

  const commands = findNodes(ast, 'Command');
  const functions = findNodes(ast, 'FunctionDefinition');
  const ifStatements = findNodes(ast, 'IfStatement');
  const forLoops = findNodes(ast, 'ForStatement');
  const whileLoops = findNodes(ast, 'WhileStatement');
  const caseStatements = findNodes(ast, 'CaseStatement');
  const variables = findNodes(ast, 'VariableAssignment');

  return {
    totalCommands: commands.length,
    functions: functions.map(f => f.node.name.text),
    controlStructures: {
      if: ifStatements.length,
      for: forLoops.length,
      while: whileLoops.length,
      case: caseStatements.length
    },
    variables: variables.map(v => v.node.name.text),
    complexity: commands.length + ifStatements.length * 2 +
               forLoops.length * 3 + whileLoops.length * 3
  };
}
```

## Best Practices

### Performance

1. **Use selective traversal** when possible instead of processing all nodes
2. **Cache parsed ASTs** for repeated operations
3. **Use compact parsing** for large files when location information isn't needed
4. **Batch transformations** instead of multiple separate traversals

### Error Handling

1. **Always wrap parsing in try-catch** blocks
2. **Validate AST structure** before transformations
3. **Provide meaningful error messages** with location information
4. **Handle edge cases** in custom plugins

### Code Quality

1. **Use TypeScript** for better type safety
2. **Write comprehensive tests** for transformations
3. **Document custom node types** and plugins
4. **Follow the existing AST structure** when extending

### Plugin Development

1. **Use the PluginSDK** for consistent plugin structure
2. **Validate plugin inputs** and outputs
3. **Handle dependencies** properly
4. **Provide clear error messages** for plugin failures

## Conclusion

The bash-traverse library provides a powerful and flexible API for working with Bash scripts programmatically. Whether you're building a code transformer, linter, analyzer, or any other tool, the comprehensive AST representation and rich traversal API make it easy to implement complex transformations while maintaining code fidelity.

For more advanced usage patterns and examples, refer to the test files in the `src/__tests__/` directory and the plugin examples in the `src/plugins/` directory.