# Bash-Traverse Parsing Scenarios for BashCodeshift

This document outlines parsing scenarios that need to be addressed in bash-traverse to make it ideal for bashcodeshift use cases.

## Current Issues (Confirmed by Testing)

### 1. Multi-Line Script Parsing - **CRITICAL**

**Problem**: bash-traverse currently treats multi-line scripts as a single command with multiple arguments, rather than separate commands.

**Current Behavior**:
```bash
npm install
npm test
npm run build
```

**Current AST Output**:
```json
{
  "type": "Program",
  "body": [
    {
      "type": "Command",
      "name": { "type": "Word", "text": "npm" },
      "arguments": [
        { "type": "Word", "text": "install" },
        { "type": "Word", "text": "npm" },
        { "type": "Word", "text": "test" },
        { "type": "Word", "text": "npm" },
        { "type": "Word", "text": "run" },
        { "type": "Word", "text": "build" }
      ]
    }
  ]
}
```

**Regenerated Output**:
```bash
npm install npm test npm run build
```

**Expected Behavior**:
```json
{
  "type": "Program",
  "body": [
    {
      "type": "Command",
      "name": { "type": "Word", "text": "npm" },
      "arguments": [{ "type": "Word", "text": "install" }]
    },
    {
      "type": "Command",
      "name": { "type": "Word", "text": "npm" },
      "arguments": [{ "type": "Word", "text": "test" }]
    },
    {
      "type": "Command",
      "name": { "type": "Word", "text": "npm" },
      "arguments": [
        { "type": "Word", "text": "run" },
        { "type": "Word", "text": "build" }
      ]
    }
  ]
}
```

**Expected Regenerated Output**:
```bash
npm install
npm test
npm run build
```

**Impact**: This makes it impossible to transform individual commands in multi-line scripts, which is a core requirement for codemods.

### 2. Code Generation Formatting - **CRITICAL**

**Problem**: bash-traverse's `generate()` function doesn't preserve multi-line formatting, collapsing all commands onto a single line.

**Current Behavior**:
```bash
# Input (multi-line)
npm install
npm test
npm run build

# After parsing and regenerating
npm install npm test npm run build
```

**Expected Behavior**:
```bash
# Input (multi-line)
npm install
npm test
npm run build

# After parsing and regenerating (should preserve formatting)
npm install
npm test
npm run build
```

**Impact**: This destroys code readability and structure, making transformed scripts unusable in real-world scenarios.

### 3. Function Definition Syntax - **CRITICAL**

**Problem**: bash-traverse doesn't properly handle the `function name()` syntax.

**Current Behavior**:
```bash
function test() {
    echo "hello"
}
```

**Error**: `Error: Expected {, got LPAREN`

**Expected Behavior**: Should parse as a `FunctionDefinition` node with proper body structure.

### 4. Shebang and Comments Handling

**Problem**: Shebangs and comments are not properly preserved in the AST structure.

**Current Behavior**:
```bash
#!/bin/bash
# This is a comment
npm install
```

**Expected Behavior**: Should include shebang and comments as separate nodes in the AST.

### 5. Pipeline and Compound Commands

**Problem**: Complex bash constructs like pipelines and compound commands need better support.

**Examples**:
```bash
# Pipeline
npm install | grep "success"

# Compound command
npm install && npm test

# Subshell
(npm install && npm test)

# Brace group
{ npm install; npm test; }
```

## Required Scenarios for BashCodeshift

### Scenario 1: Command-by-Command Transformation
**Use Case**: Transform individual commands in a script while preserving structure.

**Input**:
```bash
#!/bin/bash
# Install dependencies
npm install lodash
npm install --save-dev jest
npm test
npm run build
```

**Expected AST Structure**:
```json
{
  "type": "Program",
  "body": [
    { "type": "Shebang", "text": "#!/bin/bash" },
    { "type": "Comment", "text": "# Install dependencies" },
    {
      "type": "Command",
      "name": { "type": "Word", "text": "npm" },
      "arguments": [
        { "type": "Word", "text": "install" },
        { "type": "Word", "text": "lodash" }
      ]
    },
    {
      "type": "Command",
      "name": { "type": "Word", "text": "npm" },
      "arguments": [
        { "type": "Word", "text": "install" },
        { "type": "Word", "text": "--save-dev" },
        { "type": "Word", "text": "jest" }
      ]
    },
    {
      "type": "Command",
      "name": { "type": "Word", "text": "npm" },
      "arguments": [{ "type": "Word", "text": "test" }]
    },
    {
      "type": "Command",
      "name": { "type": "Word", "text": "npm" },
      "arguments": [
        { "type": "Word", "text": "run" },
        { "type": "Word", "text": "build" }
      ]
    }
  ]
}
```

### Scenario 2: Function and Control Structure Support
**Use Case**: Transform commands within functions and control structures.

**Input**:
```bash
function build() {
    npm install
    npm run build
}

if [ -f package.json ]; then
    npm install
    npm test
fi

for i in {1..5}; do
    npm run test-$i
done
```

**Expected AST Structure**: Should properly parse functions, if statements, and loops with their bodies as compound lists.

### Scenario 3: Complex Bash Constructs
**Use Case**: Handle advanced bash features for comprehensive codemod support.

**Input**:
```bash
# Variable assignments
NODE_ENV=production npm run build

# Here documents
npm install << EOF
lodash
express
EOF

# Command substitution
echo "Installing $(npm list --depth=0)"

# Arithmetic expansion
for i in $(seq 1 $((5+1))); do
    npm run test-$i
done
```

### Scenario 4: Preserving Formatting and Comments
**Use Case**: Maintain script formatting and comments during transformations.

**Input**:
```bash
#!/bin/bash
# This script installs dependencies
# and runs tests

# Install production dependencies
npm install --production

# Install dev dependencies
npm install --save-dev jest

# Run tests
npm test
```

**Expected Behavior**: All comments and formatting should be preserved in the AST and regenerated correctly.

## Priority Order

1. **CRITICAL**: Multi-line script parsing (separate commands)
2. **CRITICAL**: Code generation formatting (preserve multi-line structure)
3. **CRITICAL**: Function definition syntax support
4. **High Priority**: Shebang and comment preservation
5. **High Priority**: Pipeline and compound command support
6. **Medium Priority**: Advanced bash constructs (here documents, arithmetic expansion)

## Testing Requirements

For each scenario, we need:
1. **Parser Tests**: Verify correct AST generation
2. **Generator Tests**: Verify correct code regeneration
3. **Transformation Tests**: Verify AST can be modified and regenerated
4. **Integration Tests**: Verify end-to-end transform functionality

## Impact on BashCodeshift

Addressing these scenarios will enable:
- Reliable command-by-command transformations
- Support for complex bash scripts
- Preservation of script structure and comments
- Comprehensive codemod capabilities
- Better developer experience with accurate source mapping

## Current Workarounds

Until these issues are resolved in bash-traverse, bashcodeshift currently:
1. Uses simplified test fixtures with single commands
2. Handles the multi-line parsing limitation by processing arguments as potential commands
3. Avoids function definitions with parentheses syntax
4. Works around comment and shebang preservation issues

## Test Script

A test script `test-parsing-scenarios.js` has been created to demonstrate these issues and can be used to verify fixes in bash-traverse.

## Recommendations

### For bashcodeshift Development
1. **Continue with simplified test fixtures** until bash-traverse issues are resolved
2. **Focus on single-command transformations** that work reliably
3. **Create a roadmap** for when bash-traverse improvements are available

### For bash-traverse Development
1. **Prioritize multi-line parsing** as it's blocking most real-world use cases
2. **Fix code generation formatting** - this is critical for usability (transformed code must be readable)
3. **Add support for `function name()` syntax** - common in real-world bash scripts
4. **Add comprehensive test suite** for the scenarios documented in `bash-traverse-parsing-scenarios.md`
5. **Ensure backward compatibility** with existing bashcodeshift transforms

## Critical Success Criteria

For bashcodeshift to be usable in production, bash-traverse must:

1. **Parse multi-line scripts as separate commands** - each line should be a distinct command node
2. **Preserve formatting during code generation** - multi-line input should produce multi-line output
3. **Support common bash syntax** - including `function name()` declarations
4. **Maintain code readability** - transformed scripts should be as readable as the original

Without these fixes, bashcodeshift transforms will produce unreadable, single-line scripts that are unusable in real-world scenarios.