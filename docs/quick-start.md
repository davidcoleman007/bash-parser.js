# Quick Start Guide

Get up and running with bashcodeshift in 5 minutes.

## Installation

```bash
npm install -g bashcodeshift
```

## Your First Transform

Create a simple transform that adds a debug statement to all echo commands:

```typescript
// debug-echo.ts
import { TransformFunction } from 'bashcodeshift';

const transform: TransformFunction = async (fileInfo, api) => {
  const j = api.b(fileInfo.source);

  // Find all echo commands
  const echoCommands = j.findCommands('echo');

  // Add a debug statement before each echo
  j.forEach(echoCommands, path => {
    const debugCommand = j.Command({
      name: 'echo',
      arguments: ['[DEBUG] About to echo:', ...path.node.arguments]
    });

    path.insertBefore(debugCommand);
  });

  return j.toSource();
};

export default transform;
```

## Run the Transform

```bash
# Transform a single file
bashcodeshift -t debug-echo.ts script.sh

# Transform multiple files with glob pattern
bashcodeshift -t debug-echo.ts "**/*.sh"

# Dry run to see what would change
bashcodeshift -t debug-echo.ts --dry-run script.sh
```

## What Just Happened?

1. **Parsed**: Your Bash script was parsed into an AST
2. **Found**: All `echo` commands were located
3. **Transformed**: A debug statement was added before each echo
4. **Generated**: The modified code was written back to the file

## Next Steps

- [Transform API](./transform-api.md) - Learn the full API
- [Space and Newline Tokens](./tokens.md) - Critical for proper code generation
- [Common Patterns](./common-patterns.md) - Reusable transform patterns
- [Examples](./examples.md) - Complete working examples