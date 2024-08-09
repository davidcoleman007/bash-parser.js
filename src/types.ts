import type { AstNodeScript } from '~/ast/types.ts';

export type Resolvers = {
  /**
   * A callback to resolve shell alias. If specified, the parser calls it whenever it needs to resolve an alias. It should return the resolved code if the alias exists, otherwise `null`. If the option is not specified, the parser won't try to resolve any alias.
   *
   * @param name - The name of the alias to resolve.
   * @returns The resolved code if the alias exists, otherwise `null`.
   */
  resolveAlias?: (name: string) => string | undefined;

  /**
   * A callback to resolve environment variables. If specified, the parser calls it whenever it needs to resolve an environment variable. It should return the value if the variable is defined, otherwise `null`. If the option is not specified, the parser won't try to resolve any environment variable.
   *
   * @param name - The name of the environment variable to resolve.
   * @returns The value if the variable is defined, otherwise `null`.
   */
  resolveEnv?: (name: string) => string | null;

  /**
   * A callback to resolve path globbing. If specified, the parser calls it whenever it needs to resolve path globbing. It should return the expanded path. If the option is not specified, the parser won't try to resolve any path globbing.
   *
   * @param text - The text to resolve.
   * @returns The expanded path.
   */
  resolvePath?: (text: string) => string;

  /**
   * A callback to resolve users' home directories. If specified, the parser calls it whenever it needs to resolve a tilde expansion. If the option is not specified, the parser won't try to resolve any tilde expansion. When the callback is called with a null value for `username`, the callback should return the current user's home directory.
   *
   * @param username - The username whose home directory to resolve, or `null` for the current user.
   * @returns The home directory of the specified user, or the current user's home directory if `username` is `null`.
   */
  resolveHomeUser?: (username: string | null) => string;

  /**
   * A callback to resolve parameter expansion. If specified, the parser calls it whenever it needs to resolve a parameter expansion. It should return the result of the expansion. If the option is not specified, the parser won't try to resolve any parameter expansion.
   *
   * @param parameterAST - The AST of the parameter to resolve.
   * @returns The result of the parameter expansion.
   */
  resolveParameter?: (parameterAST: object) => string;

  /**
   * A callback to execute a [simple_command](https://github.com/vorpaljs/bash-parser/blob/master/docs/ast.md#simple_command). If specified, the parser calls it whenever it needs to resolve a command substitution. It receives as argument the AST of a [simple_command node](https://github.com/vorpaljs/bash-parser/blob/master/docs/ast.md#simple_command), and shall return the output of the command. If the option is not specified, the parser won't try to resolve any command substitution.
   *
   * @param cmdAST - The AST of the simple command to execute.
   * @returns The output of the command.
   */
  execCommand?: (cmdAST: object) => string;

  /**
   * A callback to execute a [complete_command](https://github.com/vorpaljs/bash-parser/blob/master/docs/ast.md#complete_command) in a new shell process. If specified, the parser calls it whenever it needs to resolve a subshell statement. It receives as argument the AST of a [complete_command node](https://github.com/vorpaljs/bash-parser/blob/master/docs/ast.md#complete_command), and shall return the output of the command. If the option is not specified, the parser won't try to resolve any subshell statement.
   *
   * @param scriptAST - The AST of the complete command to execute.
   * @returns The output of the command.
   */
  execShellScript?: (scriptAST: object) => string;

  /**
   * A callback to execute an [arithmetic_expansion](https://github.com/vorpaljs/bash-parser/blob/master/docs/ast.md#arithmetic_expansion). If specified, the parser calls it whenever it needs to resolve an arithmetic substitution. It receives as argument the AST of an [arithmetic_expansion node](https://github.com/vorpaljs/bash-parser/blob/master/docs/ast.md#arithmetic_expansion), and shall return the result of the calculation. If the option is not specified, the parser won't try to resolve any arithmetic expansion substitution. Please note that the arithmetic expression AST is built using [babylon](https://github.com/babel/babylon), you can find there its AST specification.
   *
   * @param arithmeticAST - The AST of the arithmetic expression to evaluate.
   * @returns The result of the calculation.
   */
  runArithmeticExpression?: (arithmeticAST: object) => string;
};

export type Options = Resolvers & {
  /**
   * Which mode to use for the parsing. The mode specifies the tokenizer, lexer phases, grammar, and AST builder to use. Default is `posix`.
   */
  mode?: string;

  /**
   * If `true`, includes lines and columns information in the source file.
   */
  insertLOC?: boolean;
};

export type Parse = (sourceCode: string, options?: Options) => AstNodeScript;
