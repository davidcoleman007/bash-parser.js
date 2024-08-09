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
- Supports asynchronous resolvers [Ongoing]
- Compatible with Deno

## Installation

```bash
deno add @ein/bash-parser
# or
jsr add @ein/bash-parser
```

## Usage

```ts
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

### Options

You can pass an options object to the `parse` function to customize its behavior.

```ts
export type Options = {
  /**
   * Which mode to use for the parsing. The mode specifies the tokenizer, lexer phases, grammar, and AST builder to use. Default is `bash`.
   */
  mode?: string;

  /**
   * If `true`, includes lines and columns information in the source file.
   */
  insertLOC?: boolean;

  /**
   * A callback to resolve shell alias. If specified, the parser calls it whenever it needs to resolve an alias. It should return the resolved code if the alias exists, otherwise `null`.
   */
  resolveAlias?: (name: string) => string | undefined;

  /**
   * A callback to resolve environment variables. If specified, the parser calls it whenever it needs to resolve an environment variable. It should return the value if the variable is defined, otherwise `null`.
   */
  resolveEnv?: (name: string) => string | null;

  /**
   * A callback to resolve path globbing. If specified, the parser calls it whenever it needs to resolve path globbing. It should return the expanded path.
   */
  resolvePath?: (text: string) => string;

  /**
   * A callback to resolve users' home directories. If specified, the parser calls it whenever it needs to resolve a tilde expansion. If the option is not specified, the parser won't try to resolve any tilde expansion.
   */
  resolveHomeUser?: (username: string | null) => string;

  /**
   * A callback to resolve parameter expansion. If specified, the parser calls it whenever it needs to resolve a parameter expansion. It should return the result of the expansion.
   */
  resolveParameter?: (parameterAST: object) => string;

  /**
   * A callback to execute a simple command. If specified, the parser calls it whenever it needs to resolve a command substitution. It receives as argument the AST of a simple command node, and shall return the output of the command.
   */
  execCommand?: (cmdAST: object) => string;

  /**
   * A callback to execute a complete command in a new shell process. If specified, the parser calls it whenever it needs to resolve a subshell statement. It receives as argument the AST of a complete command node, and shall return the output of the command.
   */
  execShellScript?: (scriptAST: object) => string;

  /**
   * A callback to execute an arithmetic expansion. If specified, the parser calls it whenever it needs to resolve an arithmetic substitution. It receives as argument the AST of an arithmetic expansion node, and shall return the result of the calculation.
   */
  runArithmeticExpression?: (arithmeticAST: object) => string;
};
```

Example usage with options:

```ts
import parse from '@ein/bash-parser';

const options = {
  mode: 'bash',
  insertLOC: true,
  resolveEnv: (name) => process.env[name] || null,
};

const ast = await parse('echo $HOME', options);
```

## Documentation

### AST

The Abstract Syntax Tree (AST) types represent the hierarchical structure of the source code. Each node in the AST corresponds to a specific language construct.

#### `AstNode`

`AstNode` is the base type of all nodes in the AST. It contains a `type` property that specifies the kind of node.

```ts
export type AstNode = {
  type: string;
  loc?: AstSourceLocation;
  async?: boolean;
};
```

#### `AstSourceLocation`

If the source is parsed specifying the `insertLOC` option, each node contains a `loc` property that includes the starting and ending lines and columns of the node, and the start and end index of the character in the source string.

```ts
export type AstSourceLocation = {
  start: AstSourcePosition;
  end: AstSourcePosition;
};
```

#### `AstSourcePosition`

Represents the position in the source code.

```ts
export type AstSourcePosition = {
  row?: number;
  col?: number;
  char?: number;
};
```

#### `AstNodeScript`

`Script` is the root node of the AST. It represents a list of commands that form the body of the script.

```ts
export type AstNodeScript = AstNode & {
  type: 'Script';
  commands: Array<
    | AstNodeLogicalExpression
    | AstNodePipeline
    | AstNodeCommand
    | AstNodeFunction
    | AstNodeSubshell
    | AstNodeFor
    | AstNodeCase
    | AstNodeIf
    | AstNodeWhile
    | AstNodeUntil
  >;
};
```

#### `AstNodePipeline`

`Pipeline` represents a list of commands concatenated with pipes. Commands are executed in parallel, and the output of each one becomes the input of the subsequent.

```ts
export type AstNodePipeline = AstNode & {
  type: 'Pipeline';
  commands: Array<
    | AstNodeCommand
    | AstNodeFunction
    | AstNodeSubshell
    | AstNodeFor
    | AstNodeCase
    | AstNodeIf
    | AstNodeWhile
    | AstNodeUntil
  >;
};
```

#### `AstNodeLogicalExpression`

`LogicalExpression` represents two commands (left and right) concatenated in an `and` (&&) or `or` (||) operation.

```ts
export type AstNodeLogicalExpression = AstNode & {
  type: 'LogicalExpression';
  left: AstNode;
  right: AstNode;
  operator: '&&' | '||';
};
```

#### `AstNodeCommand`

Represents a command in the AST.

```ts
export type AstNodeCommand = AstNode & {
  type: 'Command';
  prefix?: AstNode[];
  name?: AstNodeName;
  suffix?: AstNode[];
  redirections?: AstNodeRedirect[];
};
```

#### `AstNodeFunction`

Represents a function definition in the AST.

```ts
export type AstNodeFunction = AstNode & {
  type: 'Function';
  name: AstNodeName;
  body: AstNodeCompoundList;
};
```

#### `AstNodeSubshell`

`Subshell` node represents a Subshell command. It consists of a group of one or more commands to execute in a separate shell environment.

```ts
export type AstNodeSubshell = AstNode & {
  type: 'Subshell';
  list: AstNodeCompoundList;
};
```

#### `AstNodeFor`

A `For` statement. The for loop shall execute a sequence of commands for each member in a list of items.

```ts
export type AstNodeFor = AstNode & {
  type: 'For';
  name: AstNodeName;
  wordlist?: AstNodeWord[];
  do: AstNodeCompoundList;
};
```

#### `AstNodeCase`

A `Case` statement. The conditional construct Case shall execute the CompoundList corresponding to the first one of several patterns that is matched by the `clause` Word.

```ts
export type AstNodeCase = AstNode & {
  type: 'Case';
  clause: AstNodeWord;
  cases?: AstNodeCaseItem[];
};
```

#### `AstNodeIf`

A `If` statement. The if command shall execute a CompoundList and use its exit status to determine whether to execute the `then` CompoundList or the optional `else` one.

```ts
export type AstNodeIf = AstNode & {
  type: 'If';
  clause: AstNodeCompoundList;
  then: AstNodeCompoundList;
  else?: AstNodeCompoundList;
};
```

#### `AstNodeWhile`

A `While` statement. The While loop shall continuously execute one CompoundList as long as another CompoundList has a zero exit status.

```ts
export type AstNodeWhile = AstNode & {
  type: 'While';
  clause: AstNodeCompoundList;
  do: AstNodeCompoundList;
};
```

#### `AstNodeUntil`

A `Until` statement. The Until loop shall continuously execute one CompoundList as long as another CompoundList has a non-zero exit status.

```ts
export type AstNodeUntil = AstNode & {
  type: 'Until';
  clause: AstNodeCompoundList;
  do: AstNodeCompoundList;
};
```

#### `AstNodeRedirect`

A `Redirect` represents the redirection of input or output stream of a command to or from a filename or another stream.

```ts
export type AstNodeRedirect = AstNode & {
  type: 'Redirect';
  op: AstNodeWord;
  file: AstNodeWord;
  numberIo?: AstIoNumber;
};
```

#### `AstNodeWord`

A `Word` node could appear in various parts of the AST. It's formed by a series of characters and is subjected to `tilde expansion`, `parameter expansion`, `command substitution`, `arithmetic expansion`, `pathName expansion`, `field splitting`, and `quote removal`.

```ts
export type AstNodeWord = AstNode & {
  type: 'Word';
  text: string;
};
```

#### `AstNodeAssignmentWord`

A special kind of Word that represents the assignment of a value to an environment variable.

```ts
export type AstNodeAssignmentWord = AstNode & {
  type: 'AssignmentWord';
  text: string;
  expansion: Array<
    | AstNodeArithmeticExpansion
    | AstNodeCommandExpansion
    | AstNodeParameterExpansion
  >;
};
```

#### `AstNodeArithmeticExpansion`

An `ArithmeticExpansion` represents an arithmetic expansion operation to perform in the Word. The parsing of the arithmetic expression is done using the Babel parser.

```ts
export type AstNodeArithmeticExpansion = AstNode & {
  type: 'ArithmeticExpansion';
  expression: string;
  resolved: boolean;
  arithmeticAST: any;
};
```

#### `AstNodeCommandExpansion`

A `CommandExpansion` represents a command substitution operation to perform on the Word. The parsing of the command is done recursively using `bash-parser` itself.

```ts
export type AstNodeCommandExpansion = AstNode & {
  type: 'CommandExpansion';
  command: string;
  resolved: boolean;
  commandAST: any;
};
```

#### `AstNodeParameterExpansion`

A `ParameterExpansion` represents a parameter expansion operation to perform on the Word. The `op` and `Word` properties represent, in the case of special parameters, respectively the operator used and the right Word of the special parameter.

```ts
export type AstNodeParameterExpansion = AstNode & {
  type: 'ParameterExpansion';
  op: string;
  word: AstNodeWord;
  resolved: boolean;
};
```

#### `AstNodeCompoundList`

`CompoundList` represents a group of commands that form the body of `for`, `until`, `while`, `if`, `else`, `case` items, and `function` command. It can also represent a simple group of commands, with an optional list of redirections.

```ts
export type AstNodeCompoundList = AstNode & {
  type: 'CompoundList';
  commands: Array<
    | AstNodeLogicalExpression
    | AstNodePipeline
    | AstNodeCommand
    | AstNodeFunction
    | AstNodeSubshell
    | AstNodeFor
    | AstNodeCase
    | AstNodeIf
    | AstNodeWhile
    | AstNodeUntil
  >;
  redirections?: AstNodeRedirect[];
};
```

#### `AstNodeCaseItem`

`CaseItem` represents a single pattern item in a `Cases` list of a Case. It's formed by the pattern to match against and the corresponding set of statements to execute if it is matched.

```ts
export type AstNodeCaseItem = AstNode & {
  type: 'CaseItem';
  pattern: AstNodeWord[];
  body: AstNodeCompoundList;
};
```

#### `AstNodeName`

Valid Name values should be formed by one or more alphanumeric characters or underscores, and they cannot start with a digit.

```ts
export type AstNodeName = AstNode & {
  type: 'Name';
  text: string;
};
```

### How the parser works

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

## Contributing

Contributions are welcome! Please see the [`CONTRIBUTING.md`](./CONTRIBUTING.md) file for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License. See the [`LICENSE`](./LICENCE) file for more details. Other included code are described in [`CREDITS.md`](./CREDITS.md).

## Contact

For questions or support, please open an issue on the [GitHub repository](https://github.com/mattiasrunge/bash-parser/issues).

```
```
