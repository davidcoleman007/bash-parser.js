# BashCodeshift Documentation

BashCodeshift is a jscodeshift-like tool for transforming Bash shell scripts. It provides a familiar API for writing code modifications (codemods) that can parse, analyze, and transform Bash code with full round-trip fidelity.

## Quick Start

```bash
# Install bashcodeshift
npm install -g bashcodeshift

# Run a transform
bashcodeshift -t examples/transforms/update-package-manager.ts *.sh
```

## Documentation Index

### Getting Started
- [Installation & Setup](./installation.md) - How to install and configure bashcodeshift
- [Quick Start Guide](./quick-start.md) - Your first transform in 5 minutes
- [CLI Usage](./cli-usage.md) - Command-line interface reference

### Core Concepts
- [Transform API](./transform-api.md) - The jscodeshift-like API for writing transforms
- [AST Navigation](./ast-navigation.md) - How to find and traverse AST nodes
- [Code Generation](./code-generation.md) - Generating code with proper formatting

### Advanced Topics
- [Space and Newline Tokens](./tokens.md) - Critical: How to handle whitespace in bash-traverse
- [Common Patterns](./common-patterns.md) - Reusable transform patterns
- [Error Handling](./error-handling.md) - Best practices for robust transforms
- [Testing Transforms](./testing.md) - How to test your transforms

### Reference
- [API Reference](./api-reference.md) - Complete API documentation
- [AST Node Types](./ast-nodes.md) - All available AST node types
- [Examples](./examples.md) - Complete working examples

### Integration
- [bash-traverse Integration](./bash-traverse-integration.md) - How bashcodeshift works with bash-traverse
- [Migration Guide](./migration.md) - Migrating from other tools

## Key Features

- **jscodeshift-like API**: Familiar patterns for developers who know jscodeshift
- **Full Bash Support**: Complete AST parsing and generation for Bash scripts
- **Round-trip Fidelity**: Parse → Transform → Generate maintains code structure
- **File Management**: Built-in glob support, backup creation, and dry-run mode
- **TypeScript Support**: Full TypeScript support with type safety

## Architecture

BashCodeshift is built on top of [bash-traverse](https://git.corp.adobe.com/dcoleman/bash-traverse), a comprehensive Bash AST parser and generator. BashCodeshift provides the jscodeshift-like layer that handles:

- File discovery and management
- Transform execution and error handling
- CLI interface and argument parsing
- Statistics and reporting

While bash-traverse handles:
- AST parsing and generation
- Node traversal and manipulation
- Code formatting and token management

## Getting Help

- [GitHub Issues](https://github.com/your-org/bashcodeshift/issues) - Report bugs and request features
- [Examples](./examples.md) - Working examples for common use cases
- [bash-traverse Documentation](https://git.corp.adobe.com/dcoleman/bash-traverse) - Underlying AST library docs