# bash-parser

Parses bash source code to produce an AST.

## Table of Contents

- [About This Fork](#about-this-fork)
- [Objectives](#objectives)
- [Non-Objectives](#non-objectives)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## About This Fork

This project is a fork of the original [bash-parser](https://github.com/vorpaljs/bash-parser) project, which appears to be unmaintained.

### Objectives

- Minimize dependencies where feasible
- Migrate the codebase to TypeScript
- Ensure compatibility with [Deno](https://deno.com/) instead of [Node.js](https://nodejs.org/)
- Update the API to support asynchronous resolvers
- Perform code cleanup and refactoring
- Distribute releases via [JSR](https://jsr.io/)

### Non-Objectives

- No guarantee of compatibility with the original project
- No guarantee of full `bash` compatibility, though contributions are welcome
- Maintain only a `bash` parser to simplify the project, without separate `posix` and `bash` parsers

## Features

- Parses bash source code to produce an AST
- Supports asynchronous resolvers
- Compatible with Deno

## Installation

```bash
deno add @ein/bash-parser
# or
jsr add @ein/bash-parser
```

## Usage

```TypeScript
import parse from '@ein/bash-parser';

const ast = await parse('echo ciao');
```

`ast` result is:

```js
{
  type: "Script",
  commands: [
    {
      type: "SimpleCommand",
      name: {
        text: "echo",
        type: "Word"
      },
      suffix: [
        {
          text: "ciao",
          type: "Word"
        }
      ]
    }
  ]
}
```

## Documentation

### High level overview

#### Lexer (Tokenizer)

The lexer, also known as the tokenizer, is responsible for converting the raw source code into a sequence of tokens. Tokens are the smallest units of meaning, such as keywords, operators, identifiers, and literals.

##### Process:

- The `tokenize` function takes a set of reducers and returns a generator function that processes the source code.
- It iterates through the source code character by character, applying reducers to generate tokens.
- The state is updated and tokens are emitted as they are identified.

#### Parser

The parser takes the sequence of tokens produced by the lexer and organizes them into a structured format called an Abstract Syntax Tree (AST). The AST represents the hierarchical structure of the source code.

##### Process:

- The `astBuilder` function creates an AST builder object with methods to construct various AST nodes.
- These methods are used to build different parts of the AST, such as commands, loops, conditionals, etc.
- The AST nodes include location information to map back to the original source code.

#### AST Builder

The AST builder is a utility that helps in constructing the AST nodes. It provides methods to create different types of nodes and set their properties, including source location information.

##### Process:

- The AST builder methods are used by the parser to create nodes for different language constructs.
- Each method takes relevant information (e.g., patterns, body, location) and returns an AST node.

### Flow

1. **Tokenization:** The lexer (`tokenize` function) processes the source code and generates tokens.
2. **Parsing:** The parser consumes these tokens and uses the AST builder to construct the AST.
3. **AST Building:** The AST builder methods are called by the parser to create nodes for different constructs, organizing the tokens into a hierarchical structure.

#### Example Flow

**Source Code:** `let x = 5;`

1. **Lexer:** Converts to tokens: `LET`, `IDENTIFIER(x)`, `EQUALS`, `NUMBER(5)`, `SEMICOLON`
2. **Parser:** Consumes tokens and uses AST builder to create nodes:
   - `VariableDeclaration` node with child nodes for `Identifier` and `Literal`
3. **AST Builder:** Methods like `variableDeclaration`, `identifier`, and `literal` are called to create and link nodes.

This structured approach allows for easier manipulation and analysis of the source code, enabling further steps like code generation, optimization, or interpretation.

## Contributing

Contributions are welcome! Please see the [CONTRIBUTING.md](./CONTRIBUTING.md) file for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENCE) file for more details. Other included code are described in [CREDITS](./CREDITS).

## Contact

For questions or support, please open an issue on the [GitHub repository](https://github.com/mattiasrunge/bash-parser/issues).
