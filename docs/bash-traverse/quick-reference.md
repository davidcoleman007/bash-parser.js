# Bash-Traverse Quick Reference

A quick reference guide for the bash-traverse library API.

## Core Functions

### Parsing
```typescript
import { parse } from 'bash-traverse';

// Basic parsing
const ast = parse('echo "Hello, World!"');

// With plugins
const ast = parse(source, [plugin1, plugin2]);

// With options
const ast = parse(source, plugins, {
  locations: true,
  comments: true
});
```

### Code Generation
```typescript
import { generate } from 'bash-traverse';

// Basic generation
const code = generate(ast);

// With options
const code = generate(ast, {
  comments: true,
  compact: false,
  indent: '    '
});
```

### AST Traversal
```typescript
import { traverse, findNodes, findNode, hasNode, countNodes } from 'bash-traverse';

// Traverse with visitor
traverse(ast, {
  Command(path) {
    console.log('Found command:', path.node.name.text);
  }
});

// Find nodes
const commands = findNodes(ast, 'Command');
const firstIf = findNode(ast, 'IfStatement');
const hasFunctions = hasNode(ast, 'FunctionDefinition');
const commandCount = countNodes(ast, 'Command');
```

## AST Node Types

### Common Node Types
- `Program` - Root node containing all statements
- `Command` - Shell commands (echo, ls, etc.)
- `Pipeline` - Commands connected with |, &&, ||
- `IfStatement` - if/then/else constructs
- `ForStatement` - for loops
- `WhileStatement` - while loops
- `CaseStatement` - case statements
- `FunctionDefinition` - Function definitions
- `VariableAssignment` - Variable assignments (VAR=value)
- `TestExpression` - [ ... ] and [[ ... ]] test expressions

### Text Elements
- `Word` - Text tokens (commands, arguments, strings)
- `Comment` - Comments (# ...)
- `Space` - Whitespace
- `Newline` - Line breaks

## NodePath API

```typescript
interface NodePath<T = ASTNode> {
  node: T;                    // The AST node
  parent: NodePath | null;    // Parent node path
  parentKey: string | null;   // Key in parent object
  parentIndex: number | null; // Index in parent array
  type: string;               // Node type

  // Navigation
  get(key: string): NodePath | null;
  getNode(key: string): ASTNode | null;
  isNodeType(type: string): boolean;

  // Modification
  replaceWith(node: ASTNode): void;
  insertBefore(node: ASTNode): void;
  insertAfter(node: ASTNode): void;
  remove(): void;
}
```

## Common Patterns

### Adding Logging to Commands
```typescript
traverse(ast, {
  Command(path) {
    const command = path.node;
    if (command.name.text === 'echo') {
      const logCommand = {
        type: 'Command',
        name: { type: 'Word', text: 'logger' },
        arguments: [{ type: 'Word', text: 'INFO' }]
      };
      path.insertBefore(logCommand);
    }
  }
});
```

### Finding and Replacing Commands
```typescript
const commands = findNodes(ast, 'Command');
commands.forEach(path => {
  const command = path.node;
  if (command.name.text === 'old-command') {
    command.name.text = 'new-command';
  }
});
```

### Adding Error Handling to If Statements
```typescript
traverse(ast, {
  IfStatement(path) {
    const ifNode = path.node;
    if (!ifNode.elseBody) {
      ifNode.elseBody = [{
        type: 'Command',
        name: { type: 'Word', text: 'echo' },
        arguments: [{ type: 'Word', text: 'Error occurred' }]
      }];
    }
  }
});
```

## Plugin System

### Basic Plugin Structure
```typescript
import { PluginSDK } from 'bash-traverse';

const sdk = new PluginSDK();

const plugin = {
  name: 'my-plugin',
  version: '1.0.0',

  commands: [
    sdk.createCommandHandler('custom-command', {
      parse: (tokens, startIndex) => ({ node, consumedTokens }),
      generate: (node) => 'custom-command --option'
    })
  ],

  visitors: [
    sdk.createVisitor('my-visitor', {
      Command(path) {
        // Transform commands
      }
    })
  ]
};
```

### Plugin Registry
```typescript
import { PluginRegistry } from 'bash-traverse';

const registry = new PluginRegistry();
registry.register(plugin);
const plugins = registry.getAllPlugins();
```

## Error Handling

```typescript
try {
  const ast = parse(source);
  // Process AST
} catch (error) {
  if (error instanceof SyntaxError) {
    console.error('Parse error:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Performance Tips

- Use `compact: true` for large files when location info isn't needed
- Use selective traversal instead of processing all nodes
- Cache parsed ASTs for repeated operations
- Batch transformations instead of multiple traversals

## Common AST Node Properties

### Command Node
```typescript
{
  type: 'Command',
  name: Word,           // Command name
  arguments: Word[],    // Command arguments
  redirects: Redirect[], // I/O redirections
  prefixStatements?: Statement[], // VAR=value before command
  async?: boolean,      // & at end
  hasSpaceBefore?: boolean,
  hasSpaceAfter?: boolean
}
```

### If Statement Node
```typescript
{
  type: 'IfStatement',
  condition: Statement,     // Test condition
  thenBody: Statement[],    // Then block
  elifClauses: ElifClause[], // Elif blocks
  elseBody?: Statement[]    // Else block
}
```

### Word Node
```typescript
{
  type: 'Word',
  text: string,        // The text content
  quoted?: boolean,    // Is it quoted?
  quoteType?: '"' | "'" | '`' // Quote type if quoted
}
```

## Round-trip Example

```typescript
// Parse → Transform → Generate
const source = 'echo "Hello, World!"';
const ast = parse(source);

// Transform
traverse(ast, {
  Command(path) {
    // Add logging
    path.insertBefore({
      type: 'Command',
      name: { type: 'Word', text: 'logger' },
      arguments: [{ type: 'Word', text: 'INFO' }]
    });
  }
});

// Generate
const transformed = generate(ast);
// Result: logger INFO; echo "Hello, World!"
```