# Bash-Traverse Documentation

Welcome to the bash-traverse documentation! This library provides a comprehensive solution for parsing, analyzing, and generating Bash shell scripts with full round-trip capabilities.

## 📚 Documentation Index

### Core Documentation
- **[API Guide](api-guide.md)** - Comprehensive API reference with detailed examples
- **[Quick Reference](quick-reference.md)** - Concise overview of most commonly used functions
- **[Practical Examples](practical-examples.md)** - Real-world usage patterns and code samples

### Additional Resources
- **[Bash Traverse Parsing Scenarios](bash-traverse-parsing-scenarios.md)** - Detailed parsing examples
- **[Bashcodeshift Integration Examples](bashcodeshift-integration-examples.md)** - Integration patterns
- **[Function Body Parsing Refactor](function-body-parsing-refactor.md)** - Advanced parsing techniques
- **[Prefix Statements AST](prefix-statements-ast.md)** - AST structure documentation

## 🚀 Quick Start

### Installation
```bash
npm install bash-traverse
```

### Basic Usage
```typescript
import { parse, generate, traverse } from 'bash-traverse';

// Parse Bash code into AST
const ast = parse('echo "Hello, World!"');

// Transform the AST
traverse(ast, {
  Command(path) {
    console.log('Found command:', path.node.name.text);
  }
});

// Generate code from AST
const code = generate(ast);
```

## 🎯 Key Features

- **Complete Bash Parsing** - Supports all major Bash constructs
- **AST Manipulation** - Rich API for traversing and modifying AST nodes
- **Code Generation** - Generate Bash code with formatting control
- **Plugin System** - Extensible architecture for custom commands
- **Round-trip Fidelity** - Parse → Transform → Generate maintains structure

## 📖 What's in Each Guide

### API Guide
The comprehensive API reference covering:
- Core API functions and classes
- AST node types and structure
- Parsing and generation options
- AST traversal and manipulation
- Plugin system architecture
- Advanced usage patterns
- Best practices and performance tips

### Quick Reference
A concise reference for:
- Most commonly used functions
- AST node types at a glance
- Common patterns and examples
- Plugin system basics
- Performance tips

### Practical Examples
Real-world examples for building:
- Code migration tools
- Script analyzers
- Code formatters
- Security scanners
- Documentation generators
- Testing tools

## 🛠️ Common Use Cases

### Building a Code Transformer
```typescript
import { parse, generate, traverse } from 'bash-traverse';

function transformScript(source: string): string {
  const ast = parse(source);

  traverse(ast, {
    Command(path) {
      // Add logging to all commands
      const logCommand = {
        type: 'Command',
        name: { type: 'Word', text: 'logger' },
        arguments: [{ type: 'Word', text: 'INFO' }]
      };
      path.insertBefore(logCommand);
    }
  });

  return generate(ast);
}
```

### Creating a Script Analyzer
```typescript
import { parse, findNodes, countNodes } from 'bash-traverse';

function analyzeScript(source: string) {
  const ast = parse(source);

  const commands = findNodes(ast, 'Command');
  const functions = findNodes(ast, 'FunctionDefinition');
  const complexity = countNodes(ast, 'IfStatement') +
                   countNodes(ast, 'ForStatement') +
                   countNodes(ast, 'WhileStatement');

  return {
    commandCount: commands.length,
    functionCount: functions.length,
    complexity
  };
}
```

### Building a Plugin
```typescript
import { PluginSDK } from 'bash-traverse';

const sdk = new PluginSDK();

const myPlugin = {
  name: 'my-plugin',
  version: '1.0.0',

  commands: [
    sdk.createCommandHandler('custom-command', {
      parse: (tokens, startIndex) => ({ node, consumedTokens }),
      generate: (node) => 'custom-command --option'
    })
  ],

  visitors: [
    sdk.createVisitor('my-visitor', {
      Command(path) {
        // Transform commands
      }
    })
  ]
};
```

## 🔧 Development Tools

### TypeScript Support
Full TypeScript support with comprehensive type definitions for all AST nodes and API functions.

### Plugin Development
Extensive plugin system for extending parsing, transformation, and generation capabilities.

### Testing
Comprehensive test suite with examples for all major Bash constructs.

## 📋 AST Node Types

The library supports all major Bash constructs:

- **Commands** - Shell commands (echo, ls, etc.)
- **Control Structures** - if/then/else, for, while, case
- **Functions** - Function definitions and calls
- **Pipelines** - Commands connected with |, &&, ||
- **Variables** - Variable assignments and expansions
- **Test Expressions** - [ ... ] and [[ ... ]] syntax
- **Comments** - Single-line and multi-line comments
- **And more...**

## 🤝 Contributing

We welcome contributions! Please see the main project README for contribution guidelines.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Related Projects

- **[Bashcodeshift](https://github.com/example/bashcodeshift)** - Code transformation tool built with bash-traverse
- **[Shellcheck](https://www.shellcheck.net/)** - Static analysis tool for shell scripts
- **[Bash-it](https://github.com/Bash-it/bash-it)** - Community bash framework

---

For questions, issues, or contributions, please visit our [GitHub repository](https://github.com/example/bash-traverse).