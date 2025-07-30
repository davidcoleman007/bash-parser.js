# bash-traverse Integration

How bashcodeshift works with the underlying bash-traverse library.

## Architecture Overview

Bashcodeshift is built as a thin layer over [bash-traverse](https://git.corp.adobe.com/dcoleman/bash-traverse), providing a jscodeshift-like API while bash-traverse handles the core AST parsing and generation.

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   bashcodeshift │    │   bash-traverse  │    │   Bash Scripts  │
│                 │    │                  │    │                 │
│ • CLI Interface │───▶│ • AST Parsing    │───▶│ • .sh files     │
│ • File Manager  │    │ • AST Generation │    │ • Scripts       │
│ • Transform API │    │ • Node Traversal │    │ • Commands      │
│ • Error Handling│    │ • Token System   │    │ • Variables     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## What bashcodeshift Provides

### High-Level API
- **jscodeshift-like interface** for familiar patterns
- **File management** with glob support and backup creation
- **CLI interface** with options like dry-run and verbose mode
- **Error handling** and statistics tracking
- **TypeScript support** with full type safety

### Transform Execution
- **Transform runner** that orchestrates the process
- **File discovery** using glob patterns
- **Statistics collection** (processed, changed, errors)
- **Backup creation** before modifications

## What bash-traverse Provides

### Core AST Operations
- **Parsing**: Convert Bash code to AST
- **Generation**: Convert AST back to Bash code
- **Traversal**: Navigate and modify AST nodes
- **Token system**: Handle spaces, newlines, and formatting

### AST Node Types
- **Commands**: `npm install`, `echo "hello"`
- **Variable assignments**: `DEBUG=true`
- **Control structures**: `if`, `for`, `while`
- **Functions**: `function_name() { ... }`
- **Comments**: `# This is a comment`

## Integration Points

### 1. AST Creation

```typescript
// bashcodeshift creates the bash-traverse parser
const j = api.b(fileInfo.source);

// This calls bash-traverse's parse function internally
// parse(source) -> AST
```

### 2. Node Finding

```typescript
// bashcodeshift provides convenient find methods
const commands = j.find('Command');
const npmCommands = j.findCommands('npm');

// These use bash-traverse's traverse function internally
// traverse(ast, { Command(path) { ... } })
```

### 3. Code Generation

```typescript
// bashcodeshift calls bash-traverse's generate function
return j.toSource();

// This calls bash-traverse's generate(ast) -> string
```

### 4. Node Manipulation

```typescript
// bashcodeshift provides path-based manipulation
path.insertBefore(newNode);
path.replaceWith(newNode);
path.remove();

// These modify the bash-traverse AST directly
```

## Key Differences from jscodeshift

### 1. Token System

Unlike jscodeshift, bash-traverse requires explicit token management:

```typescript
// ❌ jscodeshift style (doesn't work)
const command = j.Command({
  name: 'npm',
  arguments: ['install', 'lodash']
});

// ✅ bash-traverse style (required)
const command = {
  type: 'Command',
  name: { type: 'Word', text: 'npm' },
  arguments: [
    { type: 'Space', value: ' ' },
    { type: 'Word', text: 'install' },
    { type: 'Space', value: ' ' },
    { type: 'Word', text: 'lodash' }
  ],
  redirects: []
};
```

### 2. AST Structure

Bash AST nodes have different properties than JavaScript AST nodes:

```typescript
// JavaScript AST (jscodeshift)
{
  type: 'CallExpression',
  callee: { type: 'Identifier', name: 'console.log' },
  arguments: [{ type: 'StringLiteral', value: 'hello' }]
}

// Bash AST (bash-traverse)
{
  type: 'Command',
  name: { type: 'Word', text: 'echo' },
  arguments: [
    { type: 'Space', value: ' ' },
    { type: 'Word', text: 'hello' }
  ],
  redirects: []
}
```

### 3. Traversal Patterns

Bash traversal uses different patterns:

```typescript
// jscodeshift style
j(fileInfo.source)
  .find(j.CallExpression)
  .forEach(path => {
    // ...
  });

// bashcodeshift style
const j = api.b(fileInfo.source);
const commands = j.find('Command');
j.forEach(commands, path => {
  // ...
});
```

## Direct bash-traverse Usage

You can access bash-traverse directly for advanced use cases:

```typescript
import { parse, generate, traverse } from 'bash-traverse';

const transform: TransformFunction = async (fileInfo, api) => {
  // Parse with bash-traverse directly
  const ast = parse(fileInfo.source);

  // Use bash-traverse's traverse function
  traverse(ast, {
    Command(path) {
      const command = path.node;
      if (command.name.text === 'npm') {
        // Modify the command
        command.name.text = 'yarn';
      }
    }
  });

  // Generate with bash-traverse directly
  return generate(ast);
};
```

## Understanding bash-traverse AST

### Program Structure

```typescript
interface Program {
  type: 'Program';
  body: Statement[];      // Array of statements
  comments: Comment[];    // Array of comments
}
```

### Common Node Types

```typescript
// Command node
{
  type: 'Command',
  name: { type: 'Word', text: 'npm' },
  arguments: [
    { type: 'Space', value: ' ' },
    { type: 'Word', text: 'install' }
  ],
  redirects: []
}

// Variable assignment node
{
  type: 'VariableAssignment',
  name: { type: 'Word', text: 'DEBUG' },
  value: { type: 'Word', text: 'true' }
}

// If statement node
{
  type: 'IfStatement',
  condition: { type: 'Word', text: '[ $? -ne 0 ]' },
  body: [/* array of statements */],
  elseBody: [/* array of statements */]
}
```

### Token Types

```typescript
// Word token (command names, arguments, etc.)
{ type: 'Word', text: 'npm' }

// Space token (whitespace)
{ type: 'Space', value: ' ' }

// Newline token (line breaks)
{ type: 'Newline' }

// Comment token
{ type: 'Comment', text: '# This is a comment' }
```

## Best Practices

### 1. Use bashcodeshift API When Possible

```typescript
// ✅ Preferred - use bashcodeshift API
const commands = j.find('Command');
j.forEach(commands, path => {
  // ...
});

// ❌ Avoid - direct bash-traverse unless needed
const ast = j.getAST();
traverse(ast, {
  Command(path) {
    // ...
  }
});
```

### 2. Understand Token Requirements

```typescript
// ✅ Always include space tokens
const command = {
  type: 'Command',
  name: { type: 'Word', text: 'echo' },
  arguments: [
    { type: 'Space', value: ' ' },
    { type: 'Word', text: 'Hello World' }
  ],
  redirects: []
};

// ❌ Missing space tokens
const command = {
  type: 'Command',
  name: { type: 'Word', text: 'echo' },
  arguments: [
    { type: 'Word', text: 'Hello World' }  // Missing space!
  ],
  redirects: []
};
```

### 3. Handle Newlines Properly

```typescript
// ✅ Include newline tokens when inserting
const newCommand = { /* ... */ };
const newline = { type: 'Newline' };
path.insertBefore(newCommand);
path.insertBefore(newline);

// ❌ Missing newline tokens
path.insertBefore(newCommand);  // Commands will be on same line
```

### 4. Use Helper Functions

```typescript
// ✅ Create helper functions for common patterns
function createCommand(name: string, ...args: string[]) {
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
    arguments: arguments_,
    redirects: []
  };
}
```

## Debugging

### Inspect AST Structure

```typescript
const j = api.b(fileInfo.source);
const ast = j.getAST();

// Log the AST structure
console.log(JSON.stringify(ast, null, 2));

// Find specific nodes
const commands = j.find('Command');
console.log('Found commands:', commands.length);
```

### Test Token Generation

```typescript
// Test your token structure
const testCommand = {
  type: 'Command',
  name: { type: 'Word', text: 'echo' },
  arguments: [
    { type: 'Space', value: ' ' },
    { type: 'Word', text: 'test' }
  ],
  redirects: []
};

const result = j.toSource();
console.log('Generated:', result);  // Should be "echo test"
```

## Related Documentation

- [bash-traverse API Guide](https://git.corp.adobe.com/dcoleman/bash-traverse/blob/main/docs/api-guide.md) - Complete bash-traverse documentation
- [Space and Newline Tokens](./tokens.md) - Critical token management
- [Transform API](./transform-api.md) - bashcodeshift API reference
- [Common Patterns](./common-patterns.md) - Reusable patterns
- [Examples](./examples.md) - Working examples