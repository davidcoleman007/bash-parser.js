# Space and Newline Tokens

**⚠️ Critical**: Understanding how to handle whitespace is essential for successful bashcodeshift development. Unlike jscodeshift, bash-traverse requires explicit token management for spaces and newlines.

## The Problem

Bash is highly sensitive to whitespace. Consider this command:

```bash
npm install lodash
```

If you create a command without proper spacing, you get:

```bash
npminstalllodash  # ❌ Invalid
```

## Solution: Explicit Tokens

Bashcodeshift (via bash-traverse) requires explicit tokens for spaces and newlines:

```typescript
// ❌ Wrong - will generate "npminstalllodash"
const command = j.Command({
  name: 'npm',
  arguments: ['install', 'lodash']
});

// ✅ Correct - will generate "npm install lodash"
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

## Token Types

### Space Token
```typescript
{ type: 'Space', value: ' ' }
```
- Used between command name and arguments
- Used between multiple arguments
- `value` can be any whitespace string

### Newline Token
```typescript
{ type: 'Newline' }
```
- Used to separate commands on different lines
- Required when inserting new commands

### Word Token
```typescript
{ type: 'Word', text: 'command-name' }
```
- Represents actual text content
- Used for command names, arguments, variables, etc.

## Common Patterns

### Creating a Simple Command
```typescript
const command = {
  type: 'Command',
  name: { type: 'Word', text: 'echo' },
  arguments: [
    { type: 'Space', value: ' ' },
    { type: 'Word', text: 'Hello World' }
  ],
  redirects: []
};
```

### Creating a Command with Multiple Arguments
```typescript
const command = {
  type: 'Command',
  name: { type: 'Word', text: 'npm' },
  arguments: [
    { type: 'Space', value: ' ' },
    { type: 'Word', text: 'run' },
    { type: 'Space', value: ' ' },
    { type: 'Word', text: 'build' }
  ],
  redirects: []
};
```

### Inserting a Command with Newline
```typescript
// Create the command
const newCommand = {
  type: 'Command',
  name: { type: 'Word', text: 'echo' },
  arguments: [
    { type: 'Space', value: ' ' },
    { type: 'Word', text: 'Debug info' }
  ],
  redirects: []
};

// Create a newline
const newline = { type: 'Newline' };

// Insert both
path.insertBefore(newCommand);
path.insertBefore(newline);
```

## Helper Functions

For convenience, you can create helper functions:

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
const command = createCommand('npm', 'install', 'lodash');
```

## Real-World Example

Here's how the rollup-pageobjects transform handles tokens:

```typescript
// Create the rollup-pageobjects command with proper spacing
const rollupCommand = {
  type: 'Command',
  name: { type: 'Word', text: 'npx' },
  arguments: [
    { type: 'Space', value: ' ' },
    { type: 'Word', text: 'rollup-pageobjects' }
  ],
  redirects: []
};

// Create a newline after the command
const newline = { type: 'Newline' };

// Insert the command and newline after the last npm command
ast.body.splice(lastNpmCommandIndex + 1, 0, rollupCommand, newline);
```

## Common Mistakes

### ❌ Forgetting Space Tokens
```typescript
// This will generate: "npminstalllodash"
const command = {
  type: 'Command',
  name: { type: 'Word', text: 'npm' },
  arguments: [
    { type: 'Word', text: 'install' },
    { type: 'Word', text: 'lodash' }
  ]
};
```

### ❌ Forgetting Newline Tokens
```typescript
// This will generate commands on the same line
path.insertBefore(newCommand);
// Missing: path.insertBefore({ type: 'Newline' });
```

### ❌ Wrong Token Structure
```typescript
// ❌ Wrong - arguments should be an array of tokens
const command = {
  type: 'Command',
  name: 'npm',
  arguments: 'install lodash'  // Should be array of tokens
};
```

## Testing Your Tokens

Always test your transforms to ensure proper spacing:

```typescript
const j = api.b('echo hello');
const command = createCommand('echo', 'world');
// ... insert command ...
const result = j.toSource();
console.log(result); // Should show: "echo hello\necho world"
```

## Related Documentation

- [bash-traverse API Guide](https://git.corp.adobe.com/dcoleman/bash-traverse/blob/main/docs/api-guide.md) - Detailed token documentation
- [Code Generation](./code-generation.md) - More about generating code
- [Common Patterns](./common-patterns.md) - Reusable token patterns