# Common Patterns

Reusable patterns for common transform scenarios in bashcodeshift.

## Command Replacement

### Replace npm with yarn

```typescript
const transform: TransformFunction = async (fileInfo, api) => {
  const j = api.b(fileInfo.source);

  const npmCommands = j.findCommands('npm');

  j.forEach(npmCommands, path => {
    const command = path.node;
    const args = command.arguments
      .filter(arg => arg.text !== ' ')
      .map(arg => arg.text);

    if (args[0] === 'install') {
      // npm install -> yarn add
      const yarnCommand = {
        type: 'Command',
        name: { type: 'Word', text: 'yarn' },
        arguments: [
          { type: 'Space', value: ' ' },
          { type: 'Word', text: 'add' },
          ...args.slice(1).map(arg => [
            { type: 'Space', value: ' ' },
            { type: 'Word', text: arg }
          ]).flat()
        ],
        redirects: []
      };

      path.replaceWith(yarnCommand);
    } else if (args[0] === 'run') {
      // npm run -> yarn
      const yarnCommand = {
        type: 'Command',
        name: { type: 'Word', text: 'yarn' },
        arguments: [
          { type: 'Space', value: ' ' },
          ...args.slice(1).map(arg => [
            { type: 'Space', value: ' ' },
            { type: 'Word', text: arg }
          ]).flat()
        ],
        redirects: []
      };

      path.replaceWith(yarnCommand);
    }
  });

  return j.toSource();
};
```

### Add flags to existing commands

```typescript
const transform: TransformFunction = async (fileInfo, api) => {
  const j = api.b(fileInfo.source);

  const dockerRunCommands = j.findCommands('docker');

  j.forEach(dockerRunCommands, path => {
    const command = path.node;
    const args = command.arguments
      .filter(arg => arg.text !== ' ')
      .map(arg => arg.text);

    if (args[0] === 'run') {
      // Add --rm flag after 'run'
      const newArgs = [];
      let addedRm = false;

      for (const arg of command.arguments) {
        newArgs.push(arg);
        if (arg.text === 'run' && !addedRm) {
          newArgs.push({ type: 'Space', value: ' ' });
          newArgs.push({ type: 'Word', text: '--rm' });
          addedRm = true;
        }
      }

      command.arguments = newArgs;
    }
  });

  return j.toSource();
};
```

## Command Insertion

### Add command before specific patterns

```typescript
const transform: TransformFunction = async (fileInfo, api) => {
  const j = api.b(fileInfo.source);

  const npmCommands = j.findCommands('npm');

  j.forEach(npmCommands, path => {
    const command = path.node;
    const args = command.arguments
      .filter(arg => arg.text !== ' ')
      .map(arg => arg.text);

    if (args[0] === 'run' && args[1] === 'build') {
      // Add clean command before build
      const cleanCommand = {
        type: 'Command',
        name: { type: 'Word', text: 'npm' },
        arguments: [
          { type: 'Space', value: ' ' },
          { type: 'Word', text: 'run' },
          { type: 'Space', value: ' ' },
          { type: 'Word', text: 'clean' }
        ],
        redirects: []
      };

      const newline = { type: 'Newline' };

      path.insertBefore(cleanCommand);
      path.insertBefore(newline);
    }
  });

  return j.toSource();
};
```

### Add command at end of command block

```typescript
const transform: TransformFunction = async (fileInfo, api) => {
  const j = api.b(fileInfo.source);

  // Find the last command before a specific section
  const ast = j.getAST();
  const ifStatements = j.find('IfStatement');

  if (ifStatements.length > 0) {
    const firstIfIndex = ast.body.findIndex(node => node.type === 'IfStatement');

    // Find last command before if statement
    let lastCommandIndex = -1;
    for (let i = firstIfIndex - 1; i >= 0; i--) {
      if (ast.body[i].type === 'Command') {
        lastCommandIndex = i;
        break;
      }
    }

    if (lastCommandIndex !== -1) {
      const newCommand = {
        type: 'Command',
        name: { type: 'Word', text: 'echo' },
        arguments: [
          { type: 'Space', value: ' ' },
          { type: 'Word', text: 'Command block completed' }
        ],
        redirects: []
      };

      const newline = { type: 'Newline' };

      ast.body.splice(lastCommandIndex + 1, 0, newCommand, newline);
    }
  }

  return j.toSource();
};
```

## Variable Management

### Add environment variables

```typescript
const transform: TransformFunction = async (fileInfo, api) => {
  const j = api.b(fileInfo.source);

  const ast = j.getAST();

  // Add environment variable at the beginning
  const envVar = {
    type: 'VariableAssignment',
    name: { type: 'Word', text: 'DEBUG' },
    value: { type: 'Word', text: 'true' }
  };

  const newline = { type: 'Newline' };

  ast.body.unshift(envVar, newline);

  return j.toSource();
};
```

### Update existing variables

```typescript
const transform: TransformFunction = async (fileInfo, api) => {
  const j = api.b(fileInfo.source);

  const debugVars = j.findVariableAssignments('DEBUG');

  j.forEach(debugVars, path => {
    const variable = path.node;
    variable.value.text = 'true';
  });

  return j.toSource();
};
```

## Conditional Logic

### Add error handling to commands

```typescript
const transform: TransformFunction = async (fileInfo, api) => {
  const j = api.b(fileInfo.source);

  const criticalCommands = j.findCommands('npm');

  j.forEach(criticalCommands, path => {
    const command = path.node;
    const args = command.arguments
      .filter(arg => arg.text !== ' ')
      .map(arg => arg.text);

    if (args[0] === 'run' && args[1] === 'build') {
      // Wrap in error handling
      const ifStatement = {
        type: 'IfStatement',
        condition: { type: 'Word', text: '[ $? -ne 0 ]' },
        body: [
          {
            type: 'Command',
            name: { type: 'Word', text: 'echo' },
            arguments: [
              { type: 'Space', value: ' ' },
              { type: 'Word', text: 'Build failed!' }
            ],
            redirects: []
          },
          {
            type: 'Command',
            name: { type: 'Word', text: 'exit' },
            arguments: [
              { type: 'Space', value: ' ' },
              { type: 'Word', text: '1' }
            ],
            redirects: []
          }
        ]
      };

      const newline = { type: 'Newline' };

      path.insertAfter(ifStatement);
      path.insertAfter(newline);
    }
  });

  return j.toSource();
};
```

## Helper Functions

### Create command helper

```typescript
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

// Usage
const command = createCommand('npm', 'run', 'build');
```

### Create variable assignment helper

```typescript
function createVariableAssignment(name: string, value: string) {
  return {
    type: 'VariableAssignment',
    name: { type: 'Word', text: name },
    value: { type: 'Word', text: value }
  };
}

// Usage
const envVar = createVariableAssignment('DEBUG', 'true');
```

### Extract command arguments

```typescript
function extractCommandArgs(command: any): string[] {
  return command.arguments
    .filter((arg: any) => arg.text !== ' ')
    .map((arg: any) => arg.text);
}

// Usage
const args = extractCommandArgs(command);
if (args[0] === 'npm' && args[1] === 'install') {
  // Handle npm install
}
```

## File Structure Patterns

### Add shebang if missing

```typescript
const transform: TransformFunction = async (fileInfo, api) => {
  const j = api.b(fileInfo.source);

  const ast = j.getAST();

  // Check if file starts with shebang
  const firstNode = ast.body[0];
  if (!firstNode || firstNode.type !== 'Shebang') {
    const shebang = {
      type: 'Shebang',
      value: '#!/bin/bash'
    };

    const newline = { type: 'Newline' };

    ast.body.unshift(shebang, newline);
  }

  return j.toSource();
};
```

### Add comments to sections

```typescript
const transform: TransformFunction = async (fileInfo, api) => {
  const j = api.b(fileInfo.source);

  const npmCommands = j.findCommands('npm');

  j.forEach(npmCommands, path => {
    const command = path.node;
    const args = command.arguments
      .filter(arg => arg.text !== ' ')
      .map(arg => arg.text);

    if (args[0] === 'run' && args[1] === 'build') {
      const comment = {
        type: 'Comment',
        text: '# Building project...'
      };

      const newline = { type: 'Newline' };

      path.insertBefore(comment);
      path.insertBefore(newline);
    }
  });

  return j.toSource();
};
```

## Error Handling Patterns

### Safe command replacement

```typescript
const transform: TransformFunction = async (fileInfo, api) => {
  const j = api.b(fileInfo.source);

  try {
    const commands = j.findCommands('old-command');

    j.forEach(commands, path => {
      try {
        const newCommand = createCommand('new-command');
        path.replaceWith(newCommand);
      } catch (error) {
        api.report(`Failed to replace command: ${error.message}`);
      }
    });

    return j.toSource();
  } catch (error) {
    api.report(`Transform failed: ${error.message}`);
    return fileInfo.source; // Return original source on error
  }
};
```

### Conditional transformation

```typescript
const transform: TransformFunction = async (fileInfo, api) => {
  const j = api.b(fileInfo.source);

  // Only transform if file contains specific pattern
  if (!fileInfo.source.includes('npm')) {
    return fileInfo.source; // No changes needed
  }

  // Perform transformation
  const npmCommands = j.findCommands('npm');

  if (j.size(npmCommands) === 0) {
    return fileInfo.source; // No npm commands found
  }

  // ... transformation logic ...

  return j.toSource();
};
```

## Related Documentation

- [Space and Newline Tokens](./tokens.md) - Critical for proper code generation
- [Transform API](./transform-api.md) - Core API reference
- [Error Handling](./error-handling.md) - Best practices for robust transforms
- [Examples](./examples.md) - Complete working examples