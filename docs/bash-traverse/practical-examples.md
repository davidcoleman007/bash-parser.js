# Bash-Traverse Practical Examples

Real-world examples of using bash-traverse for building generation utilities like bashcodeshift.

## Table of Contents

1. [Code Migration Tools](#code-migration-tools)
2. [Script Analyzers](#script-analyzers)
3. [Code Formatters](#code-formatters)
4. [Security Scanners](#security-scanners)
5. [Documentation Generators](#documentation-generators)
6. [Testing Tools](#testing-tools)

## Code Migration Tools

### Upgrading Bash Version Compatibility

```typescript
import { parse, generate, traverse } from 'bash-traverse';

function upgradeBashCompatibility(source: string, targetVersion: string): string {
  const ast = parse(source);

  traverse(ast, {
    // Replace deprecated test syntax
    TestExpression(path) {
      const testNode = path.node;

      // Replace [ ... ] with [[ ... ]] for better compatibility
      if (!testNode.extended) {
        testNode.extended = true;
      }
    },

    // Update command substitutions
    CommandSubstitution(path) {
      const subNode = path.node;

      // Replace backticks with $() for better nesting
      if (subNode.style === '``') {
        subNode.style = '$()';
      }
    },

    // Add shebang if missing
    Program(path) {
      const program = path.node;

      if (!program.body.some(node => node.type === 'Shebang')) {
        const shebang = {
          type: 'Shebang',
          text: `#!/usr/bin/env bash`
        };
        program.body.unshift(shebang);
      }
    }
  });

  return generate(ast);
}

// Usage
const oldScript = `
if [ -f file.txt ]; then
  echo "File exists"
  result=\`cat file.txt\`
fi
`;

const upgraded = upgradeBashCompatibility(oldScript, '5.0');
```

### Docker Command Migration

```typescript
import { parse, generate, traverse } from 'bash-traverse';

function migrateDockerCommands(source: string): string {
  const ast = parse(source);

  traverse(ast, {
    Command(path) {
      const command = path.node;

      // Migrate old docker run syntax
      if (command.name.text === 'docker' &&
          command.arguments.length > 0 &&
          command.arguments[0].text === 'run') {

        // Add --rm flag if not present
        const hasRm = command.arguments.some(arg => arg.text === '--rm');
        if (!hasRm) {
          command.arguments.splice(1, 0, { type: 'Word', text: '--rm' });
        }

        // Add --init flag for better signal handling
        const hasInit = command.arguments.some(arg => arg.text === '--init');
        if (!hasInit) {
          command.arguments.splice(1, 0, { type: 'Word', text: '--init' });
        }
      }

      // Update docker build commands
      if (command.name.text === 'docker' &&
          command.arguments.length > 0 &&
          command.arguments[0].text === 'build') {

        // Add --no-cache for development builds
        const hasNoCache = command.arguments.some(arg => arg.text === '--no-cache');
        if (!hasNoCache) {
          command.arguments.splice(1, 0, { type: 'Word', text: '--no-cache' });
        }
      }
    }
  });

  return generate(ast);
}
```

## Script Analyzers

### Complexity Analysis

```typescript
import { parse, findNodes, countNodes } from 'bash-traverse';

interface ComplexityMetrics {
  cyclomaticComplexity: number;
  nestingDepth: number;
  commandCount: number;
  functionCount: number;
  variableCount: number;
  riskScore: number;
}

function analyzeScriptComplexity(source: string): ComplexityMetrics {
  const ast = parse(source);

  const commands = findNodes(ast, 'Command');
  const functions = findNodes(ast, 'FunctionDefinition');
  const ifStatements = findNodes(ast, 'IfStatement');
  const forLoops = findNodes(ast, 'ForStatement');
  const whileLoops = findNodes(ast, 'WhileStatement');
  const caseStatements = findNodes(ast, 'CaseStatement');
  const variables = findNodes(ast, 'VariableAssignment');

  // Calculate cyclomatic complexity
  const cyclomaticComplexity = 1 + // Base complexity
    ifStatements.length +
    forLoops.length +
    whileLoops.length +
    caseStatements.length;

  // Calculate nesting depth
  let maxNestingDepth = 0;

  function calculateNestingDepth(node: any, currentDepth: number = 0): void {
    maxNestingDepth = Math.max(maxNestingDepth, currentDepth);

    if (node.thenBody) {
      node.thenBody.forEach((stmt: any) => calculateNestingDepth(stmt, currentDepth + 1));
    }
    if (node.body) {
      node.body.forEach((stmt: any) => calculateNestingDepth(stmt, currentDepth + 1));
    }
    if (node.elseBody) {
      node.elseBody.forEach((stmt: any) => calculateNestingDepth(stmt, currentDepth + 1));
    }
  }

  ast.body.forEach(stmt => calculateNestingDepth(stmt));

  // Calculate risk score
  const riskScore = Math.min(100,
    cyclomaticComplexity * 10 +
    maxNestingDepth * 5 +
    commands.length * 0.5
  );

  return {
    cyclomaticComplexity,
    nestingDepth: maxNestingDepth,
    commandCount: commands.length,
    functionCount: functions.length,
    variableCount: variables.length,
    riskScore: Math.round(riskScore)
  };
}
```

### Dependency Analysis

```typescript
import { parse, traverse } from 'bash-traverse';

interface ScriptDependencies {
  commands: string[];
  functions: string[];
  variables: string[];
  externalTools: string[];
  files: string[];
}

function analyzeDependencies(source: string): ScriptDependencies {
  const ast = parse(source);
  const dependencies: ScriptDependencies = {
    commands: [],
    functions: [],
    variables: [],
    externalTools: [],
    files: []
  };

  const commonTools = ['docker', 'kubectl', 'aws', 'gcloud', 'terraform', 'git'];
  const fileExtensions = ['.txt', '.json', '.yaml', '.yml', '.sh', '.py', '.js'];

  traverse(ast, {
    Command(path) {
      const command = path.node;
      const commandName = command.name.text;

      if (!dependencies.commands.includes(commandName)) {
        dependencies.commands.push(commandName);
      }

      // Check for external tools
      if (commonTools.includes(commandName)) {
        dependencies.externalTools.push(commandName);
      }

      // Check for file operations
      command.arguments.forEach(arg => {
        const text = arg.text;
        if (fileExtensions.some(ext => text.endsWith(ext))) {
          dependencies.files.push(text);
        }
      });
    },

    FunctionDefinition(path) {
      const func = path.node;
      dependencies.functions.push(func.name.text);
    },

    VariableAssignment(path) {
      const varNode = path.node;
      dependencies.variables.push(varNode.name.text);
    }
  });

  return dependencies;
}
```

## Code Formatters

### Consistent Formatting

```typescript
import { parse, generate, traverse } from 'bash-traverse';

interface FormatOptions {
  indentSize: number;
  maxLineLength: number;
  useTabs: boolean;
  removeTrailingSpaces: boolean;
  addFinalNewline: boolean;
}

function formatScript(source: string, options: FormatOptions = {
  indentSize: 2,
  maxLineLength: 80,
  useTabs: false,
  removeTrailingSpaces: true,
  addFinalNewline: true
}): string {
  const ast = parse(source);

  traverse(ast, {
    // Normalize indentation
    Command(path) {
      const command = path.node;
      if (command.indentation) {
        command.indentation = options.useTabs ? '\t' : ' '.repeat(options.indentSize);
      }
    },

    // Add consistent spacing
    Pipeline(path) {
      const pipeline = path.node;
      if (pipeline.spacesBeforeOperators) {
        pipeline.spacesBeforeOperators = pipeline.operators.map(() => [{ type: 'Space', value: ' ' }]);
      }
    },

    // Normalize test expressions
    TestExpression(path) {
      const testNode = path.node;
      // Ensure consistent spacing in test expressions
      testNode.elements.forEach((element, index) => {
        if (index > 0 && !element.isOperator) {
          // Add space before arguments
          element.hasSpaceBefore = true;
        }
      });
    }
  });

  return generate(ast, {
    indent: options.useTabs ? '\t' : ' '.repeat(options.indentSize),
    compact: false,
    comments: true
  });
}
```

### Style Enforcement

```typescript
import { parse, generate, traverse } from 'bash-traverse';

function enforceStyleGuide(source: string): string {
  const ast = parse(source);

  traverse(ast, {
    // Enforce function naming convention
    FunctionDefinition(path) {
      const func = path.node;
      const name = func.name.text;

      // Convert to snake_case if needed
      if (!/^[a-z_][a-z0-9_]*$/.test(name)) {
        const snakeCase = name
          .replace(/([A-Z])/g, '_$1')
          .toLowerCase()
          .replace(/^_/, '');
        func.name.text = snakeCase;
      }
    },

    // Enforce variable naming convention
    VariableAssignment(path) {
      const varNode = path.node;
      const name = varNode.name.text;

      // Convert to UPPER_SNAKE_CASE
      if (!/^[A-Z_][A-Z0-9_]*$/.test(name)) {
        const upperSnakeCase = name
          .replace(/([A-Z])/g, '_$1')
          .toUpperCase()
          .replace(/^_/, '');
        varNode.name.text = upperSnakeCase;
      }
    },

    // Add quotes around variables
    Word(path) {
      const word = path.node;
      if (word.text.startsWith('$') && !word.quoted) {
        word.quoted = true;
        word.quoteType = '"';
        word.text = `"${word.text}"`;
      }
    }
  });

  return generate(ast);
}
```

## Security Scanners

### Security Vulnerability Detection

```typescript
import { parse, traverse } from 'bash-traverse';

interface SecurityIssue {
  type: 'warning' | 'error';
  message: string;
  line: number;
  column: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

function scanSecurityVulnerabilities(source: string): SecurityIssue[] {
  const ast = parse(source);
  const issues: SecurityIssue[] = [];

  const dangerousCommands = [
    { command: 'rm', severity: 'high' as const },
    { command: 'chmod', severity: 'medium' as const },
    { command: 'chown', severity: 'medium' as const },
    { command: 'sudo', severity: 'high' as const },
    { command: 'su', severity: 'critical' as const }
  ];

  const dangerousPatterns = [
    { pattern: /rm\s+-rf/, severity: 'critical' as const, message: 'Dangerous rm -rf command' },
    { pattern: /chmod\s+777/, severity: 'high' as const, message: 'Overly permissive chmod' },
    { pattern: /eval\s+/, severity: 'critical' as const, message: 'Dangerous eval usage' },
    { pattern: /exec\s+/, severity: 'high' as const, message: 'Dangerous exec usage' }
  ];

  traverse(ast, {
    Command(path) {
      const command = path.node;
      const commandName = command.name.text;

      // Check for dangerous commands
      const dangerousCommand = dangerousCommands.find(dc => dc.command === commandName);
      if (dangerousCommand) {
        issues.push({
          type: 'warning',
          message: `Potentially dangerous command: ${commandName}`,
          line: command.loc?.start.line || 0,
          column: command.loc?.start.column || 0,
          severity: dangerousCommand.severity
        });
      }

      // Check for dangerous patterns
      const fullCommand = generate(command);
      dangerousPatterns.forEach(pattern => {
        if (pattern.pattern.test(fullCommand)) {
          issues.push({
            type: 'error',
            message: pattern.message,
            line: command.loc?.start.line || 0,
            column: command.loc?.start.column || 0,
            severity: pattern.severity
          });
        }
      });
    },

    // Check for unquoted variables
    Word(path) {
      const word = path.node;
      if (word.text.startsWith('$') && !word.quoted) {
        issues.push({
          type: 'warning',
          message: 'Unquoted variable expansion',
          line: word.loc?.start.line || 0,
          column: word.loc?.start.column || 0,
          severity: 'medium'
        });
      }
    }
  });

  return issues;
}
```

### Input Validation Scanner

```typescript
import { parse, traverse } from 'bash-traverse';

function scanInputValidation(source: string): string[] {
  const ast = parse(source);
  const issues: string[] = [];

  traverse(ast, {
    Command(path) {
      const command = path.node;

      // Check for commands that read user input
      if (['read', 'select'].includes(command.name.text)) {
        // Look for validation in the same function or script
        const hasValidation = checkForValidation(command, path);
        if (!hasValidation) {
          issues.push(`Command ${command.name.text} reads user input without validation`);
        }
      }
    }
  });

  return issues;
}

function checkForValidation(command: any, path: any): boolean {
  // Simple check for validation patterns
  const validationPatterns = [
    /^[a-zA-Z0-9]+$/,  // alphanumeric
    /^[0-9]+$/,        // numeric
    /^[a-zA-Z]+$/,     // alphabetic
    /^[a-zA-Z0-9._-]+$/ // safe filename chars
  ];

  // Check if there are any test expressions nearby
  let currentPath = path;
  while (currentPath.parent) {
    const parent = currentPath.parent.node;
    if (parent.type === 'IfStatement' || parent.type === 'TestExpression') {
      return true;
    }
    currentPath = currentPath.parent;
  }

  return false;
}
```

## Documentation Generators

### Function Documentation

```typescript
import { parse, traverse } from 'bash-traverse';

interface FunctionDoc {
  name: string;
  description: string;
  parameters: string[];
  usage: string;
  examples: string[];
}

function generateFunctionDocumentation(source: string): FunctionDoc[] {
  const ast = parse(source);
  const functions: FunctionDoc[] = [];

  traverse(ast, {
    FunctionDefinition(path) {
      const func = path.node;
      const funcDoc: FunctionDoc = {
        name: func.name.text,
        description: '',
        parameters: [],
        usage: '',
        examples: []
      };

      // Extract description from comments
      if (func.leadingComments) {
        func.leadingComments.forEach(comment => {
          if (comment.value.startsWith('# ')) {
            funcDoc.description = comment.value.substring(2);
          }
        });
      }

      // Generate usage
      funcDoc.usage = `${func.name.text} [arguments]`;

      // Extract parameters from function body
      func.body.forEach(stmt => {
        if (stmt.type === 'Command' && stmt.name.text === 'echo') {
          // Look for parameter documentation
          stmt.arguments.forEach(arg => {
            if (arg.text.includes('$1') || arg.text.includes('$2')) {
              funcDoc.parameters.push(arg.text);
            }
          });
        }
      });

      functions.push(funcDoc);
    }
  });

  return functions;
}
```

### Script Overview Generator

```typescript
import { parse, findNodes, countNodes } from 'bash-traverse';

interface ScriptOverview {
  title: string;
  description: string;
  functions: string[];
  variables: string[];
  commands: string[];
  complexity: number;
  estimatedLines: number;
}

function generateScriptOverview(source: string): ScriptOverview {
  const ast = parse(source);

  // Extract title and description from comments
  let title = 'Untitled Script';
  let description = '';

  ast.comments.forEach(comment => {
    if (comment.value.startsWith('# Title:')) {
      title = comment.value.substring(8).trim();
    } else if (comment.value.startsWith('# Description:')) {
      description = comment.value.substring(14).trim();
    }
  });

  const functions = findNodes(ast, 'FunctionDefinition').map(f => f.node.name.text);
  const variables = findNodes(ast, 'VariableAssignment').map(v => v.node.name.text);
  const commands = findNodes(ast, 'Command').map(c => c.node.name.text);

  const complexity = countNodes(ast, 'IfStatement') +
                   countNodes(ast, 'ForStatement') +
                   countNodes(ast, 'WhileStatement') +
                   countNodes(ast, 'CaseStatement');

  return {
    title,
    description,
    functions,
    variables,
    commands,
    complexity,
    estimatedLines: source.split('\n').length
  };
}
```

## Testing Tools

### Test Case Generator

```typescript
import { parse, traverse } from 'bash-traverse';

interface TestCase {
  name: string;
  input: string;
  expectedOutput: string;
  setup?: string;
  teardown?: string;
}

function generateTestCases(source: string): TestCase[] {
  const ast = parse(source);
  const testCases: TestCase[] = [];

  traverse(ast, {
    FunctionDefinition(path) {
      const func = path.node;

      // Generate test cases for functions
      const testCase: TestCase = {
        name: `test_${func.name.text}`,
        input: `${func.name.text} test_input`,
        expectedOutput: '',
        setup: '#!/bin/bash',
        teardown: 'echo "Test completed"'
      };

      // Analyze function body to determine expected output
      func.body.forEach(stmt => {
        if (stmt.type === 'Command' && stmt.name.text === 'echo') {
          testCase.expectedOutput = stmt.arguments.map(arg => arg.text).join(' ');
        }
      });

      testCases.push(testCase);
    }
  });

  return testCases;
}
```

### Mock Generator

```typescript
import { parse, generate, traverse } from 'bash-traverse';

function generateMocks(source: string): string {
  const ast = parse(source);
  const mocks: string[] = [];

  traverse(ast, {
    Command(path) {
      const command = path.node;
      const commandName = command.name.text;

      // Generate mocks for external commands
      if (['docker', 'kubectl', 'aws', 'curl', 'wget'].includes(commandName)) {
        const mockFunction = `
# Mock for ${commandName}
${commandName}() {
  echo "MOCK: ${commandName} called with arguments: $@"
  return 0
}
`;
        mocks.push(mockFunction);
      }
    }
  });

  return mocks.join('\n');
}
```

## Integration Examples

### Building a Complete Migration Tool

```typescript
import { parse, generate, traverse } from 'bash-traverse';

class BashMigrationTool {
  private ast: any;

  constructor(source: string) {
    this.ast = parse(source);
  }

  // Apply multiple transformations
  migrate(options: {
    upgradeSyntax?: boolean;
    addLogging?: boolean;
    enforceStyle?: boolean;
    addErrorHandling?: boolean;
  }): string {
    if (options.upgradeSyntax) {
      this.upgradeSyntax();
    }

    if (options.addLogging) {
      this.addLogging();
    }

    if (options.enforceStyle) {
      this.enforceStyle();
    }

    if (options.addErrorHandling) {
      this.addErrorHandling();
    }

    return generate(this.ast);
  }

  private upgradeSyntax(): void {
    traverse(this.ast, {
      TestExpression(path) {
        if (!path.node.extended) {
          path.node.extended = true;
        }
      }
    });
  }

  private addLogging(): void {
    traverse(this.ast, {
      Command(path) {
        const logCommand = {
          type: 'Command',
          name: { type: 'Word', text: 'logger' },
          arguments: [
            { type: 'Word', text: 'INFO' },
            { type: 'Word', text: `Executing: ${path.node.name.text}` }
          ]
        };
        path.insertBefore(logCommand);
      }
    });
  }

  private enforceStyle(): void {
    traverse(this.ast, {
      FunctionDefinition(path) {
        const func = path.node;
        func.name.text = func.name.text.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      }
    });
  }

  private addErrorHandling(): void {
    traverse(this.ast, {
      Command(path) {
        const errorCheck = {
          type: 'Command',
          name: { type: 'Word', text: 'if' },
          arguments: [
            { type: 'Word', text: '[ $? -ne 0 ]' },
            { type: 'Word', text: ';' },
            { type: 'Word', text: 'then' },
            { type: 'Word', text: 'echo "Error occurred"' },
            { type: 'Word', text: ';' },
            { type: 'Word', text: 'fi' }
          ]
        };
        path.insertAfter(errorCheck);
      }
    });
  }
}

// Usage
const migrationTool = new BashMigrationTool(sourceCode);
const migratedCode = migrationTool.migrate({
  upgradeSyntax: true,
  addLogging: true,
  enforceStyle: true,
  addErrorHandling: true
});
```

These examples demonstrate the power and flexibility of the bash-traverse library for building sophisticated code generation and analysis tools. Each example can be extended and customized based on specific requirements.