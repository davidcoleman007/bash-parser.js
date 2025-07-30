# Transform API

The bashcodeshift Transform API provides a jscodeshift-like interface for writing code modifications.

## Basic Transform Structure

```typescript
import { TransformFunction } from 'bashcodeshift';

const transform: TransformFunction = async (fileInfo, api, options) => {
  const j = api.b(fileInfo.source);

  // Your transform logic here

  return j.toSource();
};

export default transform;
```

## API Parameters

### `fileInfo`
```typescript
interface FileInfo {
  source: string;      // Original file content
  path: string;        // File path
  name: string;        // File name
  extension: string;   // File extension
}
```

### `api`
```typescript
interface TransformAPI {
  b(source: string): BashCodeshiftAPI;
  report(message: string): void;
  stats: TransformStats;
}
```

### `options`
```typescript
interface RunnerOptions {
  dryRun?: boolean;           // Preview changes without writing
  verbose?: boolean;          // Show detailed output
  backup?: boolean;           // Create backup files
  encoding?: string;          // File encoding (default: 'utf8')
}
```

## BashCodeshiftAPI (`j`)

The `j` object provides the core API for AST manipulation.

### Finding Nodes

#### `j.find(nodeType, filter?)`
Find all nodes of a specific type:

```typescript
// Find all commands
const commands = j.find('Command');

// Find commands with a specific name
const npmCommands = j.find('Command', node => node.name.text === 'npm');
```

#### `j.findCommands(name)`
Find commands by name:

```typescript
const echoCommands = j.findCommands('echo');
const npmCommands = j.findCommands('npm');
```

#### `j.findVariableAssignments(name?)`
Find variable assignments:

```typescript
// Find all variable assignments
const allVars = j.findVariableAssignments();

// Find specific variable
const debugVar = j.findVariableAssignments('DEBUG');
```

#### `j.findIfStatements(condition?)`
Find if statements:

```typescript
// Find all if statements
const allIfs = j.findIfStatements();

// Find if statements with specific condition
const sonarIfs = j.findIfStatements(node =>
  node.condition.text.includes('SONAR_TOKEN')
);
```

### Collection Methods

#### `j.forEach(collection, callback)`
Iterate over a collection:

```typescript
j.forEach(npmCommands, path => {
  console.log(`Found npm command: ${path.node.name.text}`);
});
```

#### `j.filter(collection, predicate)`
Filter a collection:

```typescript
const installCommands = j.filter(npmCommands, path =>
  path.node.arguments.some(arg => arg.text === 'install')
);
```

#### `j.map(collection, callback)`
Transform a collection:

```typescript
const commandNames = j.map(npmCommands, path => path.node.name.text);
```

#### `j.size(collection)`
Get collection size:

```typescript
const count = j.size(npmCommands);
```

### Node Manipulation

#### `path.insertBefore(node)`
Insert a node before the current node:

```typescript
j.forEach(echoCommands, path => {
  const debugCommand = createCommand('echo', '[DEBUG] About to echo');
  path.insertBefore(debugCommand);
});
```

#### `path.insertAfter(node)`
Insert a node after the current node:

```typescript
j.forEach(npmCommands, path => {
  const testCommand = createCommand('npm', 'test');
  path.insertAfter(testCommand);
});
```

#### `path.replaceWith(node)`
Replace the current node:

```typescript
j.forEach(npmCommands, path => {
  if (path.node.arguments.some(arg => arg.text === 'install')) {
    const yarnCommand = createCommand('yarn', 'add');
    path.replaceWith(yarnCommand);
  }
});
```

#### `path.remove()`
Remove the current node:

```typescript
j.forEach(echoCommands, path => {
  if (path.node.arguments.some(arg => arg.text === 'debug')) {
    path.remove();
  }
});
```

### Code Generation

#### `j.toSource(options?)`
Generate code from the AST:

```typescript
return j.toSource({
  comments: true,      // Include comments
  compact: false,      // Pretty print
  indent: '  '         // Indentation
});
```

#### `j.getAST()`
Get the raw AST for advanced manipulation:

```typescript
const ast = j.getAST();
ast.body.push(newCommand);
```

### Node Constructors

#### `j.Command(props)`
Create a command node (basic usage):

```typescript
const command = j.Command({
  name: 'echo',
  arguments: ['Hello World']
});
```

**Note**: For proper spacing, use explicit tokens instead:

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

#### `j.VariableAssignment(props)`
Create a variable assignment:

```typescript
const assignment = {
  type: 'VariableAssignment',
  name: { type: 'Word', text: 'DEBUG' },
  value: { type: 'Word', text: 'true' }
};
```

## Complete Example

```typescript
import { TransformFunction } from 'bashcodeshift';

const transform: TransformFunction = async (fileInfo, api) => {
  const j = api.b(fileInfo.source);

  // Find all npm install commands
  const npmCommands = j.findCommands('npm');
  const installCommands = j.filter(npmCommands, path =>
    path.node.arguments.some(arg => arg.text === 'install')
  );

  // Replace with yarn add
  j.forEach(installCommands, path => {
    const args = path.node.arguments
      .filter(arg => arg.text !== 'install' && arg.text !== ' ')
      .map(arg => arg.text);

    const yarnCommand = {
      type: 'Command',
      name: { type: 'Word', text: 'yarn' },
      arguments: [
        { type: 'Space', value: ' ' },
        { type: 'Word', text: 'add' },
        ...args.map(arg => [
          { type: 'Space', value: ' ' },
          { type: 'Word', text: arg }
        ]).flat()
      ],
      redirects: []
    };

    path.replaceWith(yarnCommand);
  });

  return j.toSource();
};

export default transform;
```

## Related Documentation

- [Space and Newline Tokens](./tokens.md) - Critical for proper code generation
- [AST Navigation](./ast-navigation.md) - Advanced node finding and traversal
- [Common Patterns](./common-patterns.md) - Reusable transform patterns
- [bash-traverse API](https://git.corp.adobe.com/dcoleman/bash-traverse/blob/main/docs/api-guide.md) - Underlying AST library