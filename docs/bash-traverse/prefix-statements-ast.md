# prefixStatements AST Structure

## 🎯 Overview

The `prefixStatements` feature introduces a new way to represent Bash's variable assignment prefixes in the AST. This elegantly handles the distinction between:

- **Variable assignment prefixes**: `NODE_ENV=production npm run build`
- **Pipeline commands**: `NODE_ENV=production && npm run build`
- **Separate statements**: `NODE_ENV=production\nnpm run build`

## 🏗️ AST Structure

### Command Interface

```typescript
interface Command extends ASTNode {
  type: 'Command';
  name: Word;
  arguments: Word[];
  redirects: Redirect[];
  prefixStatements?: Statement[]; // NEW: Variable assignments and other prefix statements
  async?: boolean;
  leadingComments?: Comment[];
  trailingComments?: Comment[];
  hasSpaceBefore?: boolean;
  hasSpaceAfter?: boolean;
  indentation?: string;
}
```

### VariableAssignment Interface

```typescript
interface VariableAssignment extends ASTNode {
  type: 'VariableAssignment';
  name: Word;
  value: Word;
}
```

### Statement Union Type

```typescript
export type Statement =
  | Command
  | Pipeline
  | IfStatement
  | ForStatement
  | WhileStatement
  | UntilStatement
  | CaseStatement
  | FunctionDefinition
  | Subshell
  | BraceGroup
  | Comment
  | Shebang
  | NewlineStatement
  | SemicolonStatement
  | VariableAssignment; // NEW
```

## 📝 Examples

### Example 1: Basic Variable Assignment Prefix

**Input**: `NODE_ENV=production npm run build`

**AST**:
```json
{
  "type": "Program",
  "body": [{
    "type": "Command",
    "name": { "type": "Word", "text": "npm" },
    "arguments": [
      { "type": "Word", "text": "run" },
      { "type": "Word", "text": "build" }
    ],
    "redirects": [],
    "prefixStatements": [{
      "type": "VariableAssignment",
      "name": { "type": "Word", "text": "NODE_ENV" },
      "value": { "type": "Word", "text": "production" }
    }]
  }],
  "comments": []
}
```

**Generated**: `NODE_ENV=production npm run build`

### Example 2: Multiple Variable Assignments

**Input**: `NODE_ENV=production DEBUG=true npm run build`

**AST**:
```json
{
  "type": "Program",
  "body": [{
    "type": "Command",
    "name": { "type": "Word", "text": "npm" },
    "arguments": [
      { "type": "Word", "text": "run" },
      { "type": "Word", "text": "build" }
    ],
    "redirects": [],
    "prefixStatements": [
      {
        "type": "VariableAssignment",
        "name": { "type": "Word", "text": "NODE_ENV" },
        "value": { "type": "Word", "text": "production" }
      },
      {
        "type": "VariableAssignment",
        "name": { "type": "Word", "text": "DEBUG" },
        "value": { "type": "Word", "text": "true" }
      }
    ]
  }],
  "comments": []
}
```

**Generated**: `NODE_ENV=production DEBUG=true npm run build`

### Example 3: Pipeline vs Prefix

**Input 1**: `NODE_ENV=production npm run build`
**AST**: Single `Command` with `prefixStatements`

**Input 2**: `NODE_ENV=production && npm run build`
**AST**: `Pipeline` with two separate `Command` nodes

**Input 3**: `NODE_ENV=production\nnpm run build`
**AST**: Two separate `Command` nodes in `Program.body`

## 🔧 Parser Implementation

### parseCommand Method

```typescript
private parseCommand(): Command {
  // Check for variable assignment prefix (e.g., NODE_ENV=production)
  const prefixStatements: Statement[] = [];
  let commandName = this.parseWord();

  // Look ahead to see if this is a variable assignment prefix
  while (this.match('OPERATOR') && this.peek()?.value === '=') {
    // This is a variable assignment prefix
    const varName = commandName;
    this.consume('OPERATOR', 'Expected =');
    const varValue = this.parseWord();

    const loc = this.createLocation(varName.loc, varValue.loc);
    prefixStatements.push({
      type: 'VariableAssignment',
      name: varName as any,
      value: varValue as any,
      ...(loc && { loc })
    });

    // Get the next word as the actual command name
    commandName = this.parseWord();
  }

  // Parse the command normally
  const command = this.parseStandardCommand(commandName);
  if (prefixStatements.length > 0) {
    command.prefixStatements = prefixStatements;
  }
  return command;
}
```

## 🎨 Generator Implementation

### generateCommand Method

```typescript
private generateCommand(command: Command): string {
  const parts: string[] = [];

  // Add prefix statements (variable assignments)
  if (command.prefixStatements && command.prefixStatements.length > 0) {
    for (const prefixStatement of command.prefixStatements) {
      parts.push(this.generateNode(prefixStatement));
    }
  }

  // Generate command name and arguments
  parts.push(this.generateWord(command.name));
  for (const arg of command.arguments) {
    parts.push(this.generateNode(arg));
  }

  return parts.join(' ');
}
```

### generateVariableAssignment Method

```typescript
private generateVariableAssignment(assignment: VariableAssignment): string {
  return `${this.generateWord(assignment.name)}=${this.generateWord(assignment.value)}`;
}
```

## 🎯 Benefits for bashcodeshift

### 1. **Intuitive AST Structure**
- Variable assignments are clearly separated from the command
- Easy to identify and modify environment variables
- Natural representation of Bash's syntax

### 2. **Simplified Codemod Logic**
```typescript
// Easy to find and modify environment variables
if (command.prefixStatements) {
  command.prefixStatements.forEach(prefix => {
    if (prefix.type === 'VariableAssignment' && prefix.name.text === 'NODE_ENV') {
      prefix.value.text = 'staging'; // Change environment
    }
  });
}
```

### 3. **Clear Distinction**
- **Prefix**: `NODE_ENV=production npm run build` → Single command with environment
- **Pipeline**: `NODE_ENV=production && npm run build` → Two separate commands
- **Separate**: `NODE_ENV=production\nnpm run build` → Two separate statements

### 4. **Preserves Bash Semantics**
- Environment variables only affect the single command
- No confusion with pipeline semantics
- Maintains original spacing and formatting

## 🧪 Testing

### Test Scenarios

1. **Basic functionality**: `NODE_ENV=production npm run build`
2. **Multiple assignments**: `NODE_ENV=production DEBUG=true npm run build`
3. **Quoted values**: `NODE_ENV="production" npm run build`
4. **Function bodies**: `function test() { NODE_ENV=production npm run build }`
5. **Pipeline distinction**: Compare prefix vs `&&` vs newline
6. **Complex scenarios**: Nested functions with multiple prefixes
7. **Edge cases**: Empty values, multiple equals signs

### Test File
See `test-scenarios/07-prefix-statements.js` for comprehensive tests.

## 🚀 Integration with bashcodeshift

### Example Codemod

```typescript
// Transform all NODE_ENV assignments to staging
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

## 📋 Summary

The `prefixStatements` approach provides:

- ✅ **Clear AST representation** of Bash's variable assignment prefixes
- ✅ **Intuitive structure** for codemodding
- ✅ **Preserved semantics** of Bash's environment variable behavior
- ✅ **Distinction** between prefixes, pipelines, and separate statements
- ✅ **Comprehensive testing** and documentation
- ✅ **Ready for bashcodeshift integration**

This feature makes bashcodeshift much more intuitive for handling Bash's nuanced variable assignment syntax! 🎯