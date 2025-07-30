# Examples

Complete working examples of bashcodeshift transforms.

## Basic Examples

### 1. Add Debug Statements

Add debug echo statements before all commands.

```typescript
// add-debug-statements.ts
import { TransformFunction } from 'bashcodeshift';

const transform: TransformFunction = async (fileInfo, api) => {
  const j = api.b(fileInfo.source);

  const commands = j.find('Command');

  j.forEach(commands, path => {
    const command = path.node;
    const commandName = command.name.text;

    const debugCommand = {
      type: 'Command',
      name: { type: 'Word', text: 'echo' },
      arguments: [
        { type: 'Space', value: ' ' },
        { type: 'Word', text: `[DEBUG] Executing: ${commandName}` }
      ],
      redirects: []
    };

    const newline = { type: 'Newline' };

    path.insertBefore(debugCommand);
    path.insertBefore(newline);
  });

  return j.toSource();
};

export default transform;
```

**Input:**
```bash
npm install lodash
npm run build
echo "Done"
```

**Output:**
```bash
echo [DEBUG] Executing: npm
npm install lodash
echo [DEBUG] Executing: npm
npm run build
echo [DEBUG] Executing: echo
echo "Done"
```

### 2. Replace npm with yarn

Convert npm commands to yarn equivalents.

```typescript
// npm-to-yarn.ts
import { TransformFunction } from 'bashcodeshift';

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

export default transform;
```

**Input:**
```bash
npm install lodash express
npm run build
npm run test
```

**Output:**
```bash
yarn add lodash express
yarn build
yarn test
```

### 3. Add Environment Variables

Add environment variables at the beginning of the script.

```typescript
// add-env-vars.ts
import { TransformFunction } from 'bashcodeshift';

const transform: TransformFunction = async (fileInfo, api) => {
  const j = api.b(fileInfo.source);

  const ast = j.getAST();

  const envVars = [
    { name: 'NODE_ENV', value: 'production' },
    { name: 'DEBUG', value: 'true' },
    { name: 'PORT', value: '3000' }
  ];

  // Add environment variables at the beginning
  envVars.forEach(envVar => {
    const variable = {
      type: 'VariableAssignment',
      name: { type: 'Word', text: envVar.name },
      value: { type: 'Word', text: envVar.value }
    };

    const newline = { type: 'Newline' };

    ast.body.unshift(variable, newline);
  });

  return j.toSource();
};

export default transform;
```

**Input:**
```bash
npm install lodash
npm run build
```

**Output:**
```bash
PORT=3000
DEBUG=true
NODE_ENV=production
npm install lodash
npm run build
```

## Advanced Examples

### 4. Add Error Handling

Add error handling to critical commands.

```typescript
// add-error-handling.ts
import { TransformFunction } from 'bashcodeshift';

const transform: TransformFunction = async (fileInfo, api) => {
  const j = api.b(fileInfo.source);

  const criticalCommands = j.findCommands('npm');

  j.forEach(criticalCommands, path => {
    const command = path.node;
    const args = command.arguments
      .filter(arg => arg.text !== ' ')
      .map(arg => arg.text);

    if (args[0] === 'run' && args[1] === 'build') {
      // Add error handling after build command
      const errorCheck = {
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

      path.insertAfter(errorCheck);
      path.insertAfter(newline);
    }
  });

  return j.toSource();
};

export default transform;
```

**Input:**
```bash
npm run build
echo "Build completed"
```

**Output:**
```bash
npm run build
if [ $? -ne 0 ]; then
    echo Build failed!
    exit 1
fi
echo "Build completed"
```

### 5. Insert Commands at Specific Positions

Insert a command at the end of a command block before a specific section.

```typescript
// insert-rollup-command.ts
import { TransformFunction } from 'bashcodeshift';

const transform: TransformFunction = async (fileInfo, api) => {
  const j = api.b(fileInfo.source);

  // Find if statements that contain SonarQube analysis
  const ifStatements = j.find('IfStatement');

  if (ifStatements.length === 0) {
    return j.toSource();
  }

  const ast = j.getAST();

  // Find the position of the SonarQube if statement
  let sonarIfIndex = -1;
  for (let i = 0; i < ast.body.length; i++) {
    const statement = ast.body[i];
    if (statement.type === 'IfStatement') {
      // Check if this if statement contains SonarQube analysis
      const ifSource = j.toSource({ compact: true });
      if (ifSource.includes('SONAR_TOKEN') || ifSource.includes('SonarQube')) {
        sonarIfIndex = i;
        break;
      }
    }
  }

  if (sonarIfIndex === -1) {
    return j.toSource();
  }

  // Find the last npm command before the SonarQube if statement
  let lastNpmCommandIndex = -1;
  for (let i = sonarIfIndex - 1; i >= 0; i--) {
    const statement = ast.body[i];
    if (statement.type === 'Command' && statement.name.text === 'npm') {
      lastNpmCommandIndex = i;
      break;
    }
  }

  if (lastNpmCommandIndex === -1) {
    return j.toSource();
  }

  // Create the rollup-pageobjects command
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

  return j.toSource();
};

export default transform;
```

**Input:**
```bash
npm ci
npm run auto-increment-version
npm run update-version
npm run test
npm run build
npm run test:build
npm run build-types
npm run create-type-manifest

# SonarQube analysis
if [ -n "$SONAR_TOKEN" ]; then
    echo "SONAR_TOKEN found. Running SonarQube analysis"
    npm run test:sonar
fi
```

**Output:**
```bash
npm ci
npm run auto-increment-version
npm run update-version
npm run test
npm run build
npm run test:build
npm run build-types
npm run create-type-manifest
npx rollup-pageobjects

# SonarQube analysis
if [ -n "$SONAR_TOKEN" ]; then
    echo "SONAR_TOKEN found. Running SonarQube analysis"
    npm run test:sonar
fi
```

### 6. Complex Command Transformation

Transform Docker commands to add specific flags.

```typescript
// docker-optimize.ts
import { TransformFunction } from 'bashcodeshift';

const transform: TransformFunction = async (fileInfo, api) => {
  const j = api.b(fileInfo.source);

  const dockerCommands = j.findCommands('docker');

  j.forEach(dockerCommands, path => {
    const command = path.node;
    const args = command.arguments
      .filter(arg => arg.text !== ' ')
      .map(arg => arg.text);

    if (args[0] === 'run') {
      // Add --rm flag if not present
      const hasRmFlag = command.arguments.some(arg => arg.text === '--rm');

      if (!hasRmFlag) {
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
    } else if (args[0] === 'build') {
      // Add --no-cache flag if not present
      const hasNoCacheFlag = command.arguments.some(arg => arg.text === '--no-cache');

      if (!hasNoCacheFlag) {
        const newArgs = [];
        let addedNoCache = false;

        for (const arg of command.arguments) {
          newArgs.push(arg);
          if (arg.text === 'build' && !addedNoCache) {
            newArgs.push({ type: 'Space', value: ' ' });
            newArgs.push({ type: 'Word', text: '--no-cache' });
            addedNoCache = true;
          }
        }

        command.arguments = newArgs;
      }
    }
  });

  return j.toSource();
};

export default transform;
```

**Input:**
```bash
docker run -it node:16 bash
docker build -t myapp .
```

**Output:**
```bash
docker run --rm -it node:16 bash
docker build --no-cache -t myapp .
```

## Utility Examples

### 7. Helper Functions

Create reusable helper functions for common operations.

```typescript
// helpers.ts
export function createCommand(name: string, ...args: string[]) {
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

export function createVariableAssignment(name: string, value: string) {
  return {
    type: 'VariableAssignment',
    name: { type: 'Word', text: name },
    value: { type: 'Word', text: value }
  };
}

export function extractCommandArgs(command: any): string[] {
  return command.arguments
    .filter((arg: any) => arg.text !== ' ')
    .map((arg: any) => arg.text);
}

// transform-using-helpers.ts
import { TransformFunction } from 'bashcodeshift';
import { createCommand, createVariableAssignment, extractCommandArgs } from './helpers';

const transform: TransformFunction = async (fileInfo, api) => {
  const j = api.b(fileInfo.source);

  // Add environment variable
  const ast = j.getAST();
  const envVar = createVariableAssignment('DEBUG', 'true');
  const newline = { type: 'Newline' };
  ast.body.unshift(envVar, newline);

  // Transform npm commands
  const npmCommands = j.findCommands('npm');

  j.forEach(npmCommands, path => {
    const args = extractCommandArgs(path.node);

    if (args[0] === 'install') {
      const yarnCommand = createCommand('yarn', 'add', ...args.slice(1));
      path.replaceWith(yarnCommand);
    }
  });

  return j.toSource();
};

export default transform;
```

### 8. Conditional Transformation

Only transform files that meet specific criteria.

```typescript
// conditional-transform.ts
import { TransformFunction } from 'bashcodeshift';

const transform: TransformFunction = async (fileInfo, api) => {
  // Only transform files that contain npm commands
  if (!fileInfo.source.includes('npm')) {
    return fileInfo.source;
  }

  const j = api.b(fileInfo.source);

  // Only transform if file has more than 5 lines
  const lines = fileInfo.source.split('\n').length;
  if (lines < 5) {
    return fileInfo.source;
  }

  // Only transform if file contains build commands
  const buildCommands = j.findCommands('npm');
  const hasBuildCommands = buildCommands.some(path => {
    const args = path.node.arguments
      .filter(arg => arg.text !== ' ')
      .map(arg => arg.text);
    return args[0] === 'run' && args[1] === 'build';
  });

  if (!hasBuildCommands) {
    return fileInfo.source;
  }

  // Perform the transformation
  j.forEach(buildCommands, path => {
    const args = path.node.arguments
      .filter(arg => arg.text !== ' ')
      .map(arg => arg.text);

    if (args[0] === 'run' && args[1] === 'build') {
      const yarnCommand = {
        type: 'Command',
        name: { type: 'Word', text: 'yarn' },
        arguments: [
          { type: 'Space', value: ' ' },
          { type: 'Word', text: 'build' }
        ],
        redirects: []
      };

      path.replaceWith(yarnCommand);
    }
  });

  return j.toSource();
};

export default transform;
```

## Running Examples

### Using the CLI

```bash
# Run a transform on a single file
bashcodeshift -t examples/add-debug-statements.ts script.sh

# Run on multiple files
bashcodeshift -t examples/npm-to-yarn.ts "**/*.sh"

# Dry run to preview changes
bashcodeshift -t examples/add-env-vars.ts --dry-run script.sh

# Verbose output
bashcodeshift -t examples/docker-optimize.ts --verbose script.sh
```

### Using the API

```typescript
import { TransformRunner } from 'bashcodeshift';
import myTransform from './my-transform';

const runner = new TransformRunner({ dryRun: false });

// Run transform on a file
const stats = await runner.run('script.sh', myTransform);
console.log(`Processed: ${stats.processed}, Changed: ${stats.changed}`);
```

## Related Documentation

- [Quick Start Guide](./quick-start.md) - Get started quickly
- [Transform API](./transform-api.md) - Core API reference
- [Common Patterns](./common-patterns.md) - Reusable patterns
- [Space and Newline Tokens](./tokens.md) - Critical for proper code generation
- [Testing Transforms](./testing.md) - How to test your transforms