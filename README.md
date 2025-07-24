# BashCodeshift

A TypeScript-based codemod toolkit for bash scripts, inspired by jscodeshift but designed specifically for shell script transformations.

## Features

- **Bash AST Parsing**: Uses tree-sitter-bash for accurate parsing of bash scripts
- **jscodeshift-like API**: Familiar API for writing transforms
- **TypeScript Support**: Full TypeScript support with type safety
- **CLI Tool**: Command-line interface for running transforms
- **Dry Run Mode**: Preview changes without modifying files
- **File Pattern Support**: Use glob patterns to target multiple files
- **Error Handling**: Robust error handling and reporting

## Installation

```bash
npm install -g bashcodeshift
```

Or install locally:

```bash
npm install bashcodeshift
```

## Quick Start

### Basic Usage

```bash
bashcodeshift -t transform.js script.sh
```

### Transform Multiple Files

```bash
bashcodeshift -t transform.js "**/*.sh"
```

### Dry Run (Preview Changes)

```bash
bashcodeshift -t transform.js "**/*.sh" --dry
```

## Writing Transforms

Transforms are JavaScript/TypeScript functions that receive file information and return modified source code.

### Basic Transform Structure

```typescript
import { TransformFunction } from 'bashcodeshift';

const transform: TransformFunction = (fileInfo, api, options) => {
  const { source } = fileInfo;
  const { b } = api;

  // Parse source into AST
  const ast = b(source);

  // Find and transform commands
  ast.find('Command', { name: 'npm' })
    .forEach(path => {
      path.value.name = 'yarn';
    });

  // Return transformed source
  return ast.toSource();
};

export default transform;
```

### API Reference

The `api` object provides the following methods:

#### `b(source: string)`
Parse bash source code into an AST and return a bashcodeshift API.

#### AST Node Types
- `Command`: Command execution nodes
- `Variable`: Variable assignment nodes
- `Conditional`: If/else statement nodes
- `Loop`: For/while loop nodes
- `Function`: Function definition nodes
- `Pipeline`: Command pipeline nodes
- `Comment`: Comment nodes

#### Collection Methods
- `find(nodeType, filter)`: Find nodes matching criteria
- `filter(collection, predicate)`: Filter a collection
- `forEach(collection, callback)`: Iterate over a collection
- `map(collection, callback)`: Transform a collection

#### Node Manipulation
- `replace(path, newNode)`: Replace a node
- `insertBefore(path, newNode)`: Insert before a node
- `insertAfter(path, newNode)`: Insert after a node
- `remove(path)`: Remove a node

#### Source Generation
- `toSource(options)`: Generate source code from AST

### Example Transforms

#### Convert npm to yarn

```typescript
import { TransformFunction } from 'bashcodeshift';

const transform: TransformFunction = (fileInfo, api, options) => {
  const { source } = fileInfo;
  const { b } = api;

  const ast = b(source);
  const npmCommands = ast.find('Command', { name: 'npm' });

  npmCommands.forEach(path => {
    const command = path.value as any;
    command.name = 'yarn';
  });

  return ast.toSource();
};

export default transform;
```

#### Add Docker --rm flag

```typescript
import { TransformFunction } from 'bashcodeshift';

const transform: TransformFunction = (fileInfo, api, options) => {
  const { source } = fileInfo;
  const { b } = api;

  const ast = b(source);
  const dockerRunCommands = ast.find('Command', { name: 'docker' });

  dockerRunCommands.forEach(path => {
    const command = path.value as any;
    const args = command.arguments;

    if (args.length > 0 && args[0] === 'run') {
      const hasRmFlag = args.includes('--rm');

      if (!hasRmFlag) {
        command.arguments.splice(1, 0, '--rm');
      }
    }
  });

  return ast.toSource();
};

export default transform;
```

## CLI Options

```bash
bashcodeshift [options] <path>

Options:
  -t, --transform <path>      Path to transform file
  --parser <parser>           Parser to use (default: bash)
  --dry                       Dry run (no changes)
  --print                     Print output for comparison
  --verbose                   Show more information
  --ignore-pattern <pattern>  Ignore files matching pattern
  -h, --help                  Display help
```

## Testing Transforms

Use the provided test utilities to write tests for your transforms:

```typescript
import { defineTest } from 'bashcodeshift/dist/test-utils';

defineTest(__dirname, 'update-package-manager', null, 'update-package-manager', { parser: 'bash' });
```

## Development

### Prerequisites

- Node.js >= 16.0.0
- TypeScript >= 5.0.0

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run tests: `npm test`

### Available Scripts

- `npm run build`: Build TypeScript to JavaScript
- `npm run dev`: Watch mode for development
- `npm test`: Run tests
- `npm run lint`: Run ESLint
- `npm run docs`: Generate documentation

## TypeScript Benefits

- **Type Safety**: Catch errors at compile time
- **Better IDE Support**: IntelliSense and autocomplete
- **Refactoring**: Safe refactoring with confidence
- **Documentation**: Self-documenting code with types
- **Maintainability**: Easier to maintain and extend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT