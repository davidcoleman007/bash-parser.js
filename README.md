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

Look in the docs folder for detailed documentation.

## Contributing

Contributions are welcome! Please see the [CONTRIBUTING.md](./CONTRIBUTING.md) file for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENCE) file for more details. Other included code are described in [CREDITS](./CREDITS).

## Contact

For questions or support, please open an issue on the [GitHub repository](https://github.com/mattiasrunge/bash-parser/issues).
