# bashcodeshift Example: Insert Commands with Proper Newlines

This example demonstrates how to use the `insertCommandsAfter` method to properly insert commands with newlines after a specific command in a bash script.

## The Problem

Previously, when trying to insert commands after another command, you might encounter issues where newlines weren't properly handled, resulting in concatenated commands like:

```bash
npm run buildnpx rollup-uitests --batchSize=10 --debug
```

Instead of the desired:

```bash
npm run build
npx rollup-uitests --batchSize=10 --debug
```

## The Solution

The `insertCommandsAfter` method properly handles AST manipulation to ensure commands are inserted with proper newlines.

## Files in this Example

- `build-original.sh` - The original build script
- `build-modified.sh` - A pre-transformed version for comparison
- `rollup-transform.js` - The transform that adds rollup commands
- `test-example.sh` - Test script to demonstrate the functionality
- `README.md` - This documentation

## How to Run the Example

1. Make sure you're in the build-sh-example directory:
   ```bash
   cd examples/build-sh-example
   ```

2. Run the test script:
   ```bash
   chmod +x test-example.sh
   ./test-example.sh
   ```

## What the Transform Does

The transform:

1. **Removes existing rollup commands** to avoid duplicates
2. **Finds npm run build commands** in the script
3. **Inserts new commands** after the build command using `insertCommandsAfter`
4. **Maintains proper formatting** with newlines and spacing

## Before and After

**Before:**
```bash
npm run build

if [[ "$BUILD_TYPE" != "deploy-ephemeral" ]]; then
  npm run test
fi
```

**After:**
```bash
npm run build
npx rollup-uitests --batchSize=10 --debug
npx rollup-pageobjects
npx map-io-usages
npx map-source-usages

if [[ "$BUILD_TYPE" != "deploy-ephemeral" ]]; then
  npm run test
fi
```

## Key Features Demonstrated

- ✅ Proper newline handling
- ✅ Command separation on individual lines
- ✅ No concatenation issues
- ✅ AST structure preservation
- ✅ Real-world script transformation

## Using insertCommandsAfter in Your Own Transforms

```javascript
const transform = async (fileInfo, api) => {
  const j = api.b(fileInfo.source);

  // Find the target command
  const targetCommands = j.findCommands('npm');
  const npmRunBuild = targetCommands.filter(path => {
    const args = path.node.arguments
      .filter(arg => arg.text !== ' ')
      .map(arg => arg.text);
    return args[0] === 'run' && args[1] === 'build';
  });

  if (npmRunBuild.length > 0) {
    // Insert commands with proper newlines
    const commandsToAdd = [
      'npx rollup-uitests --batchSize=10 --debug',
      'npx rollup-pageobjects'
    ];

    j.insertCommandsAfter(npmRunBuild[0], commandsToAdd);
  }

  return j.toSource();
};
```

## Verification

The test script automatically verifies:

- No `npm run buildnpx` concatenation
- Proper newlines after `npm run build`
- Commands properly separated on individual lines
- Correct line count changes

This example serves as a reference for developers who need to insert commands with proper formatting in bash script transformations.