# bashcodeshift Integration Examples

## 🎯 Overview

This document provides comprehensive examples of how to use the `prefixStatements` feature with bashcodeshift for transforming Bash scripts.

## 🚀 Basic Usage

### Example 1: Change Environment Variables

**Transform**: Change all `NODE_ENV=production` to `NODE_ENV=staging`

```typescript
import { FileInfo, API } from 'jscodeshift';

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  return root
    .find(j.Command)
    .forEach(path => {
      const command = path.value;
      if (command.prefixStatements) {
        command.prefixStatements.forEach(prefix => {
          if (prefix.type === 'VariableAssignment' &&
              prefix.name.text === 'NODE_ENV') {
            prefix.value.text = 'staging';
          }
        });
      }
    })
    .toSource();
}
```

**Before**:
```bash
NODE_ENV=production npm run build
NODE_ENV=production DEBUG=true npm run test
```

**After**:
```bash
NODE_ENV=staging npm run build
NODE_ENV=staging DEBUG=true npm run test
```

### Example 2: Add Environment Variables

**Transform**: Add `DEBUG=true` to all npm commands

```typescript
import { FileInfo, API } from 'jscodeshift';

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  return root
    .find(j.Command)
    .forEach(path => {
      const command = path.value;

      // Only add DEBUG if command name is npm
      if (command.name.text === 'npm') {
        // Initialize prefixStatements if it doesn't exist
        if (!command.prefixStatements) {
          command.prefixStatements = [];
        }

        // Check if DEBUG already exists
        const hasDebug = command.prefixStatements.some(
          prefix => prefix.type === 'VariableAssignment' &&
                   prefix.name.text === 'DEBUG'
        );

        if (!hasDebug) {
          command.prefixStatements.push({
            type: 'VariableAssignment',
            name: { type: 'Word', text: 'DEBUG' },
            value: { type: 'Word', text: 'true' }
          });
        }
      }
    })
    .toSource();
}
```

**Before**:
```bash
npm run build
npm run test
NODE_ENV=production npm run deploy
```

**After**:
```bash
DEBUG=true npm run build
DEBUG=true npm run test
NODE_ENV=production DEBUG=true npm run deploy
```

### Example 3: Remove Environment Variables

**Transform**: Remove all `DEBUG=true` assignments

```typescript
import { FileInfo, API } from 'jscodeshift';

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  return root
    .find(j.Command)
    .forEach(path => {
      const command = path.value;
      if (command.prefixStatements) {
        // Filter out DEBUG assignments
        command.prefixStatements = command.prefixStatements.filter(
          prefix => !(prefix.type === 'VariableAssignment' &&
                     prefix.name.text === 'DEBUG')
        );

        // Remove prefixStatements array if empty
        if (command.prefixStatements.length === 0) {
          delete command.prefixStatements;
        }
      }
    })
    .toSource();
}
```

**Before**:
```bash
DEBUG=true npm run build
NODE_ENV=production DEBUG=true npm run test
npm run deploy
```

**After**:
```bash
npm run build
NODE_ENV=production npm run test
npm run deploy
```

## 🔧 Advanced Transformations

### Example 4: Conditional Environment Variables

**Transform**: Add `NODE_ENV=production` only to deploy commands

```typescript
import { FileInfo, API } from 'jscodeshift';

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  return root
    .find(j.Command)
    .forEach(path => {
      const command = path.value;

      // Check if this is a deploy command
      const isDeployCommand = command.arguments.some(
        arg => arg.text === 'deploy' || arg.text.includes('deploy')
      );

      if (isDeployCommand) {
        if (!command.prefixStatements) {
          command.prefixStatements = [];
        }

        // Add NODE_ENV=production if not already present
        const hasNodeEnv = command.prefixStatements.some(
          prefix => prefix.type === 'VariableAssignment' &&
                   prefix.name.text === 'NODE_ENV'
        );

        if (!hasNodeEnv) {
          command.prefixStatements.push({
            type: 'VariableAssignment',
            name: { type: 'Word', text: 'NODE_ENV' },
            value: { type: 'Word', text: 'production' }
          });
        }
      }
    })
    .toSource();
}
```

**Before**:
```bash
npm run build
npm run test
npm run deploy
```

**After**:
```bash
npm run build
npm run test
NODE_ENV=production npm run deploy
```

### Example 5: Environment Variable Migration

**Transform**: Migrate from `NODE_ENV` to `APP_ENV`

```typescript
import { FileInfo, API } from 'jscodeshift';

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  return root
    .find(j.Command)
    .forEach(path => {
      const command = path.value;
      if (command.prefixStatements) {
        command.prefixStatements.forEach(prefix => {
          if (prefix.type === 'VariableAssignment' &&
              prefix.name.text === 'NODE_ENV') {
            // Change NODE_ENV to APP_ENV
            prefix.name.text = 'APP_ENV';
          }
        });
      }
    })
    .toSource();
}
```

**Before**:
```bash
NODE_ENV=development npm run dev
NODE_ENV=production npm run build
```

**After**:
```bash
APP_ENV=development npm run dev
APP_ENV=production npm run build
```

### Example 6: Complex Value Transformations

**Transform**: Update port numbers in all commands

```typescript
import { FileInfo, API } from 'jscodeshift';

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  return root
    .find(j.Command)
    .forEach(path => {
      const command = path.value;
      if (command.prefixStatements) {
        command.prefixStatements.forEach(prefix => {
          if (prefix.type === 'VariableAssignment' &&
              prefix.name.text === 'PORT') {
            // Update port value
            const currentPort = parseInt(prefix.value.text);
            if (!isNaN(currentPort)) {
              prefix.value.text = (currentPort + 1000).toString();
            }
          }
        });
      }
    })
    .toSource();
}
```

**Before**:
```bash
PORT=3000 npm run dev
PORT=3001 npm run test
```

**After**:
```bash
PORT=4000 npm run dev
PORT=4001 npm run test
```

## 🎨 Function Transformations

### Example 7: Transform Function Bodies

**Transform**: Add environment variables to all npm commands in functions

```typescript
import { FileInfo, API } from 'jscodeshift';

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  return root
    .find(j.FunctionDefinition)
    .forEach(functionPath => {
      const functionDef = functionPath.value;

      // Find all commands in function body
      functionDef.body.forEach(statement => {
        if (statement.type === 'Command' &&
            statement.name.text === 'npm') {

          if (!statement.prefixStatements) {
            statement.prefixStatements = [];
          }

          // Add DEBUG=true if not present
          const hasDebug = statement.prefixStatements.some(
            prefix => prefix.type === 'VariableAssignment' &&
                     prefix.name.text === 'DEBUG'
          );

          if (!hasDebug) {
            statement.prefixStatements.push({
              type: 'VariableAssignment',
              name: { type: 'Word', text: 'DEBUG' },
              value: { type: 'Word', text: 'true' }
            });
          }
        }
      });
    })
    .toSource();
}
```

**Before**:
```bash
function deploy() {
  npm run build
  npm run test
  npm run deploy
}
```

**After**:
```bash
function deploy() {
  DEBUG=true npm run build
  DEBUG=true npm run test
  DEBUG=true npm run deploy
}
```

### Example 8: Conditional Function Transformations

**Transform**: Add environment variables only to specific functions

```typescript
import { FileInfo, API } from 'jscodeshift';

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  return root
    .find(j.FunctionDefinition)
    .forEach(functionPath => {
      const functionDef = functionPath.value;

      // Only transform functions with 'deploy' in the name
      if (functionDef.name.text.includes('deploy')) {
        functionDef.body.forEach(statement => {
          if (statement.type === 'Command' &&
              statement.name.text === 'npm') {

            if (!statement.prefixStatements) {
              statement.prefixStatements = [];
            }

            // Add NODE_ENV=production
            const hasNodeEnv = statement.prefixStatements.some(
              prefix => prefix.type === 'VariableAssignment' &&
                       prefix.name.text === 'NODE_ENV'
            );

            if (!hasNodeEnv) {
              statement.prefixStatements.push({
                type: 'VariableAssignment',
                name: { type: 'Word', text: 'NODE_ENV' },
                value: { type: 'Word', text: 'production' }
              });
            }
          }
        });
      }
    })
    .toSource();
}
```

**Before**:
```bash
function build() {
  npm run build
}

function deploy() {
  npm run build
  npm run deploy
}
```

**After**:
```bash
function build() {
  npm run build
}

function deploy() {
  NODE_ENV=production npm run build
  NODE_ENV=production npm run deploy
}
```

## 🔍 Utility Functions

### Example 9: Helper Functions for Common Operations

```typescript
import { FileInfo, API } from 'jscodeshift';

// Helper function to add environment variable
function addEnvVar(command: any, name: string, value: string) {
  if (!command.prefixStatements) {
    command.prefixStatements = [];
  }

  const hasVar = command.prefixStatements.some(
    prefix => prefix.type === 'VariableAssignment' &&
             prefix.name.text === name
  );

  if (!hasVar) {
    command.prefixStatements.push({
      type: 'VariableAssignment',
      name: { type: 'Word', text: name },
      value: { type: 'Word', text: value }
    });
  }
}

// Helper function to remove environment variable
function removeEnvVar(command: any, name: string) {
  if (command.prefixStatements) {
    command.prefixStatements = command.prefixStatements.filter(
      prefix => !(prefix.type === 'VariableAssignment' &&
                 prefix.name.text === name)
    );

    if (command.prefixStatements.length === 0) {
      delete command.prefixStatements;
    }
  }
}

// Helper function to update environment variable
function updateEnvVar(command: any, name: string, newValue: string) {
  if (command.prefixStatements) {
    command.prefixStatements.forEach(prefix => {
      if (prefix.type === 'VariableAssignment' &&
          prefix.name.text === name) {
        prefix.value.text = newValue;
      }
    });
  }
}

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  return root
    .find(j.Command)
    .forEach(path => {
      const command = path.value;

      // Example usage of helper functions
      if (command.name.text === 'npm') {
        addEnvVar(command, 'DEBUG', 'true');
        updateEnvVar(command, 'NODE_ENV', 'staging');
        removeEnvVar(command, 'OLD_VAR');
      }
    })
    .toSource();
}
```

## 🧪 Testing Your Transformations

### Example 10: Test Your Transformation

```typescript
import { FileInfo, API } from 'jscodeshift';

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Your transformation logic here
  return root
    .find(j.Command)
    .forEach(path => {
      const command = path.value;
      if (command.prefixStatements) {
        command.prefixStatements.forEach(prefix => {
          if (prefix.type === 'VariableAssignment' &&
              prefix.name.text === 'NODE_ENV') {
            prefix.value.text = 'staging';
          }
        });
      }
    })
    .toSource();
}

// Test cases
export const testCases = [
  {
    name: 'Basic environment variable change',
    input: 'NODE_ENV=production npm run build',
    expected: 'NODE_ENV=staging npm run build'
  },
  {
    name: 'Multiple environment variables',
    input: 'NODE_ENV=production DEBUG=true npm run build',
    expected: 'NODE_ENV=staging DEBUG=true npm run build'
  },
  {
    name: 'No environment variables',
    input: 'npm run build',
    expected: 'npm run build'
  }
];
```

## 📋 Best Practices

### 1. **Always Check for Existing Variables**
```typescript
// Good: Check if variable already exists
const hasVar = command.prefixStatements?.some(
  prefix => prefix.type === 'VariableAssignment' &&
           prefix.name.text === 'NODE_ENV'
);

// Bad: Always add without checking
command.prefixStatements.push({...});
```

### 2. **Handle Missing prefixStatements**
```typescript
// Good: Initialize if missing
if (!command.prefixStatements) {
  command.prefixStatements = [];
}

// Bad: Assume it exists
command.prefixStatements.push({...});
```

### 3. **Clean Up Empty Arrays**
```typescript
// Good: Remove empty arrays
if (command.prefixStatements.length === 0) {
  delete command.prefixStatements;
}

// Bad: Leave empty arrays
command.prefixStatements = [];
```

### 4. **Use Type Guards**
```typescript
// Good: Check type before accessing
if (prefix.type === 'VariableAssignment') {
  prefix.name.text = 'NEW_NAME';
}

// Bad: Assume type
prefix.name.text = 'NEW_NAME';
```

## 🎯 Summary

The `prefixStatements` feature makes bashcodeshift transformations much more intuitive and powerful. You can now:

- ✅ **Easily modify environment variables** in Bash commands
- ✅ **Add/remove variables** without complex string manipulation
- ✅ **Transform nested structures** like functions and loops
- ✅ **Handle complex scenarios** with multiple variables
- ✅ **Maintain Bash semantics** and formatting

This feature opens up a whole new world of possibilities for automated Bash script transformations! 🚀