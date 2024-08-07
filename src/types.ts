export type TokenIf = {
  type: string;
  value?: string;
  text?: string;
  joined?: string;
  fieldIdx?: number;
  loc: Location;
  expansion?: Expansion[];
  originalText?: string;
  originalType?: string;
  maybeSimpleCommandName?: string;
  _: Record<string, any>;

  is(type: string): boolean;
  appendTo(chunk: string): TokenIf;
  changeTokenType(type: string, value: string): TokenIf;
  setValue(value: string): TokenIf;
  alterValue(value: string): TokenIf;
  addExpansions(): TokenIf;
  setExpansions(expansion: Expansion[]): TokenIf;
};

export type Enums = {
  IOFileOperators: string[];
  operators: Record<string, string>;
  parameterOperators: Record<string, ParameterOp>;
  reservedWords: Record<string, string>;
};

export interface ReducerStateIf {
  current: string;
  escaping: boolean;
  expansion: Expansion[];
  previousReducer: Reducer;
  loc: ReducerLocation;

  setLoc(loc: ReducerLocation): this;
  setEscaping(escaping: boolean): this;
  setExpansion(expansion: Expansion[]): this;
  setPreviousReducer(previousReducer: Reducer): this;
  setCurrent(current: string): this;
  appendEmptyExpansion(): this;
  appendChar(char: string): this;
  removeLastChar(): this;
  saveCurrentLocAsStart(): this;
  resetCurrent(): this;
  advanceLoc(char: string): this;
  replaceLastExpansion(fields: Partial<Expansion>): this;
  deleteLastExpansionValue(): this;
}

export type Reducer = (state: ReducerStateIf, source: string[], reducers: Reducers) => ReducerNextState;

export type ReducerNextState = {
  tokensToEmit?: TokenIf[];
  nextReduction: Reducer | null;
  nextState?: ReducerStateIf;
};
export type Reducers = Record<string, Reducer>;

export type ReducerLocation = {
  start: LocationPosition;
  previous?: LocationPosition | null;
  current?: LocationPosition;
};

// TODO: This type needs work
export type Expansion = {
  parameter?: string;
  command?: string;
  expression?: string;
  value?: string;
  type?: string;
  resolved?: boolean;
  loc?: { start: number; end: number };
};

export type Visitor = {
  [key: string]: (tk: TokenIf, iterable?: Iterable<TokenIf>) => TokenIf[] | TokenIf | null;
};

export type Options = {
  /**
   * Which mode to use for the parsing. The mode specifies the tokenizer, lexer phases, grammar, and AST builder to use. Default is `posix`.
   */
  mode?: string;

  /**
   * If `true`, includes lines and columns information in the source file.
   */
  insertLOC?: boolean;

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

/**
 * `LexerPhase` functions are applied, in order, to the iterable returned from the `tokenizer` function. Each phase enhances or alters the tokens to produce a final token iterable, directly consumable by the grammar parser.
 *
 * Each phase is a function that accepts the parser option object, an array of all phases that precede it in the pipeline, and the utils object. The function returns another function that receives the iterable produced by the previous phase and returns the iterable to give to the subsequent one.
 */
export type LexerPhaseFn = (...input: any[]) => Iterable<TokenIf>;
export type LexerPhase = (
  options: Options,
  mode: Mode,
  previousPhases: LexerPhaseFn[],
) => (tokens: Iterable<TokenIf>) => Iterable<TokenIf>;

export type LexerPhases = Record<string, LexerPhase>;

export type Tokenizer = (code: string) => Iterable<TokenIf>;

/**
 * A mode could optionally inherit an existing one. It specifies the mode to inherit in its
 * `inherits` property. If it does, the `init` function will receive as argument the inherited mode. In this way, the child mode could use the parent mode features.
 *
 * The `init` function must return a `Mode` object.
 */

export interface LexerIf {
  yytext?: any;
  yylineno: number;
  setInput(source: string): void;
  lex(): string | undefined;
}
export interface Parser {
  lexer: LexerIf;
  yy: AstBuilder;
  parse(source: string): NodeScript;
}

export type Grammar = {
  Parser: new () => Parser;
};
export type Mode = {
  enums: Enums;

  /**
   * A function that receives reducers and returns another function that, given shell source code, returns an iterable of parsed tokens.
   *
   * @returns A function that takes shell source code and returns an iterable of parsed tokens.
   */
  tokenizer: (reducers?: Reducers) => Tokenizer;

  /**
   * An array of transform functions that are applied, in order, to the iterable of tokens returned by the `tokenizer` function.
   */
  lexerPhases: LexerPhase[];

  /**
   * A named map of all phases contained in the array. This can be used by child modes to access each phase by name and reuse them.
   */
  phaseCatalog: LexerPhases;

  /**
   * The grammar compiled function, usually imported from a Jison grammar and built using the `builder` CLI.
   */
  grammar: Grammar;

  /**
   * An object containing methods to build the final AST. This object is mixed into the Jison grammar, and any of its methods can be called directly from the grammar EBNF source.
   */
  astBuilder: (options: Options) => AstBuilder;
};

/**
 * A mode plugin consists of a module in the `src/modes` folder. The module must export a `ModePlugin` object with an optional `inherits` property and a required `init` factory function.
 */
export type ModePlugin = {
  /**
   * Specifies the mode to inherit from, if any. The `init` function will receive the inherited mode as an argument, allowing the child mode to use the parent mode's features.
   */
  inherits?: string;

  /**
   * A factory function that receives the parent mode as an argument and returns a `Mode` object.
   *
   * @param parentMode - The parent mode to inherit from.
   * @returns The new mode object.
   */
  init: (parentMode?: Mode) => Mode;
};

export type Separator = {
  type: 'separator_op' | 'newline_list';
  text: string;
};

export type LocationPosition = {
  row?: number;
  col?: number;
  char?: number;
};

type NodeIoNumber = Node & {
  type: 'io_number';
  text: string;
};

type NodeElse = Node & {
  type: 'else';
  text: 'else';
};

/**
 * If the source is parsed specifing the `insertLOC` option, each node contins a `loc` property that contains the starting and ending lines and columns of the node, and the start and end index of the character in the source string.
 */
export type Location = {
  start: LocationPosition;
  end: LocationPosition;
};

/**
 * `Node` is the base type of all nodes in the AST. It contains a `type` property that specifies the kind of node.
 */
export type Node = {
  type: string;
  loc?: Location;
  async?: boolean; // TODO: Should this be on the base type?
};

/**
 * `Script` is the root node of the AST. It simply represent a list of commands that form the body of the script.
 */
export type NodeScript = Node & {
  type: 'Script';
  commands: Array<
    | NodeLogicalExpression
    | NodePipeline
    | NodeCommand
    | NodeFunction
    | NodeSubshell
    | NodeFor
    | NodeCase
    | NodeIf
    | NodeWhile
    | NodeUntil
  >;
};

/**
 * `Pipeline` represents a list of commands concatenated with pipes.
 *
 *  Commands are executed in parallel and the output of each one become the input of the subsequent.
 */
type NodePipelineCommandItem =
  | NodeCommand
  | NodeFunction
  | NodeSubshell
  | NodeFor
  | NodeCase
  | NodeIf
  | NodeWhile
  | NodeUntil;
export type NodePipeline = Node & {
  type: 'Pipeline';
  commands: NodePipelineCommandItem[];
};

/**
 * `LogicalExpression` represents two commands (left and right) concateneted in a `and` (&&) or `or` (||) operation.
 *
 * In the `and` Case, the right command is executed only if the left one is executed successfully. In the `or` Case, the right command is executed only if the left one fails.
 */
type NodeLogicalExpressionSide =
  | NodeLogicalExpression
  | NodePipeline
  | NodeCommand
  | NodeFunction
  | NodeSubshell
  | NodeFor
  | NodeCase
  | NodeIf
  | NodeWhile
  | NodeUntil;
export type NodeLogicalExpression = Node & {
  op: string;
  left: NodeLogicalExpressionSide;
  right: NodeLogicalExpressionSide;
};

/**
 * `Command` represents a builtin or external command to execute. It could optionally have a list of arguments, stream redirection operation and environment variable assignments.
 *
 * `name` properties is a Word that represents the name of the command to execute. It is optional because Command could represents bare assignment, e.g. `VARNAME = 42;`. In this case, the command node has no name.
 */
type NodeCommandPrefix = Array<NodeAssignmentWord | NodeRedirect>;
type NodeCommandSuffix = Array<NodeWord | NodeRedirect>;
export type NodeCommand = Node & {
  type: 'Command';
  name?: NodeName;
  prefix?: NodeCommandPrefix;
  suffix?: NodeCommandSuffix;
};

/**
 * `Function` represents the definition of a Function.
 *
 * It is formed by the name of the Function itself and a list of all command that forms the body of the Function. It can also contains a list of redirection that applies to all commands of the function body.
 */
export type NodeFunction = Node & {
  type: 'Function';
  name: NodeName;
  redirections?: NodeRedirect[];
  body: NodeCompoundList;
};

/**
 * `Name` represents the Name of a Function or a `for` variable.
 *
 * Valid Name values should be formed by one or more alphanumeric characters or underscores, and the could not start with a digit.
 */
export type NodeName = Node & {
  type: 'Name';
  text: string;
};

/**
 * `CompoundList` represent a group of commands that form the body of `for`, `until` `while`, `if`, `else`, `case` items and `function` command. It can also represent a simple group of commands, with an optional list of redirections.
 */
export type NodeCompoundList = Node & {
  type: 'CompoundList';
  commands: Array<
    | NodeLogicalExpression
    | NodePipeline
    | NodeCommand
    | NodeFunction
    | NodeSubshell
    | NodeFor
    | NodeCase
    | NodeIf
    | NodeWhile
    | NodeUntil
  >;
  redirections?: NodeRedirect[];
};

/**
 * `Subshell` node represents a Subshell command. It consist of a group of one or more commands to execute in a separated shell environment.
 */
export type NodeSubshell = Node & {
  type: 'Subshell';
  list: NodeCompoundList;
};

/**
 * A `For` statement. The for loop shall execute a sequence of commands for each member in a list of items.
 */
export type NodeFor = Node & {
  type: 'For';
  name: NodeName;
  wordlist?: NodeWord[];
  do: NodeCompoundList;
};

/**
 * A `Case` statement. The conditional construct Case shall execute the CompoundList corresponding to the first one of several patterns that is matched by the `clause` Word.
 */

export type NodeCase = Node & {
  type: 'Case';
  clause: NodeWord;
  cases?: NodeCaseItem[];
};

/**
 * `CaseItem` represents a single pattern item in a `Cases` list of a Case. It's formed by the pattern to match against and the corresponding set of statements to execute if it is matched.
 */
export type NodeCaseItem = Node & {
  type: 'CaseItem';
  pattern: NodeWord[];
  body: NodeCompoundList;
};

/**
 * A `If` statement. The if command shall execute a CompoundList and use its exit status to determine whether to execute the `then` CompoundList or the optional `else` one.
 */
export type NodeIf = Node & {
  type: 'If';
  clause: NodeCompoundList;
  then: NodeCompoundList;
  else?: NodeCompoundList;
};

/**
 * A `While` statement. The While loop shall continuously execute one CompoundList as long as another CompoundList has a zero exit status.
 */
export type NodeWhile = Node & {
  type: 'While';
  clause: NodeCompoundList;
  do: NodeCompoundList;
};

/**
 * A `Until` statement. The Until loop shall continuously execute one CompoundList as long as another CompoundList has a non-zero exit status.
 */
export type NodeUntil = Node & {
  type: 'Until';
  clause: NodeCompoundList;
  do: NodeCompoundList;
};

/** A `Redirect` represents the redirection of input or output stream of a command to or from a filename or another stream. */
export type NodeRedirect = Node & {
  type: 'Redirect';
  op: NodeWord;
  file: NodeWord;
  numberIo?: NodeIoNumber;
};

/**
 * A `Word` node could appear various part of the AST. It's formed by a series of characters, and is subjected to `tilde expansion`, `parameter expansion`, `command substitution`, `arithmetic expansion`, `pathName expansion`, `field splitting` and `quote removal`.
 */
export type NodeWord = Node & {
  type: 'Word';
  text: string;
  expansion: Array<
    | NodeArithmeticExpansion
    | NodeCommandExpansion
    | NodeParameterExpansion
  >;
};

/**
 * A special kind of Word that represents assignment of a value to an environment variable.
 */
export type NodeAssignmentWord = Node & {
  type: 'AssignmentWord';
  text: string;
  expansion: Array<
    | NodeArithmeticExpansion
    | NodeCommandExpansion
    | NodeParameterExpansion
  >;
};

/**
 * A `ArithmeticExpansion` represent an arithmetic expansion operation to perform in the Word.
 *
 * The parsing of the arithmetic expression is done using [Babel parser](https://github.com/babel/babylon). See there for the `arithmeticAST` node specification.
 *
 * The `loc.start` property contains the index of the character in the Word text where the substitution starts. The `loc.end` property contains the index where it the ends.
 */
export type NodeArithmeticExpansion = Node & {
  type: 'ArithmeticExpansion';
  expression: string;
  resolved: boolean;
  arithmeticAST: any; // TODO
};

/** A `CommandExpansion` represent a command substitution operation to perform on the Word.
 *
 * The parsing of the command is done recursively using `bash-parser` itself.
 *
 * The `loc.start` property contains the index of the character in the Word text where the substitution starts. The `loc.end` property contains the index where it the ends.
 */
export type NodeCommandExpansion = Node & {
  type: 'CommandExpansion';
  command: string;
  resolved: boolean;
  commandAST: any; // TODO
};

/**
 * A `ParameterExpansion` represent a parameter expansion operation to perform on the Word.
 *
 * The `op` and `Word` properties represents, in the case of special parameters, respectively the operator used and the right Word of the special parameter.
 *
 * The `loc.start` property contains the index of the character in the Word text where the substitution starts. The `loc.end` property contains the index where it the ends.
 */
export type NodeParameterExpansion = Node & {
  type: 'ParameterExpansion';
  parameter: string;
  kind?: string;
  word?: string;
  op?: string;
};

export type AstBuilder = {
  caseItem: (
    pattern: NodeWord[],
    body: NodeCompoundList,
    locStart: Location,
    locEnd: Location,
  ) => NodeCaseItem;

  caseClause: (
    clause: NodeWord,
    cases: NodeCaseItem[],
    locStart: Location,
    locEnd: Location,
  ) => NodeCase;

  doGroup: (
    group: NodeCompoundList,
    locStart: Location,
    locEnd: Location,
  ) => NodeCompoundList;

  braceGroup: (
    group: NodeCompoundList,
    locStart: Location,
    locEnd: Location,
  ) => NodeCompoundList;

  list: (
    logicalExpression: NodeLogicalExpression,
  ) => NodeScript;

  checkAsync: (
    list: NodeScript,
    separator: Separator,
  ) => NodeScript;

  listAppend: (
    list: NodeScript,
    logicalExpression: NodeLogicalExpression,
    separator: Separator,
  ) => NodeScript;

  addRedirections: (
    compoundCommand: NodeCompoundList,
    redirectList: NodeRedirect[],
  ) => NodeCompoundList;

  term: (
    logicalExpression: NodeLogicalExpression,
  ) => NodeCompoundList;

  termAppend: (
    term: NodeCompoundList,
    logicalExpression: NodeLogicalExpression,
    separator: Separator,
  ) => NodeCompoundList;

  subshell: (
    list: NodeCompoundList,
    locStart: Location,
    locEnd: Location,
  ) => NodeSubshell;

  pipeSequence: (
    command: NodeCommand,
  ) => NodePipeline;

  pipeSequenceAppend: (
    pipe: NodePipeline,
    command: NodeCommand,
  ) => NodePipeline;

  bangPipeLine: (
    pipe: NodePipeline,
  ) => Node & { bang: boolean };

  pipeLine: (
    pipe: NodePipeline,
  ) => NodePipelineCommandItem | NodePipeline;

  andAndOr: (
    left: NodeLogicalExpressionSide,
    right: NodeLogicalExpressionSide,
  ) => NodeLogicalExpression;

  orAndOr: (
    left: NodeLogicalExpressionSide,
    right: NodeLogicalExpressionSide,
  ) => NodeLogicalExpression;

  forClause: (
    name: NodeName,
    wordlist: NodeWord[],
    doGroup: NodeCompoundList,
    locStart: Location,
  ) => NodeFor;

  forClauseDefault: (
    name: NodeName,
    doGroup: NodeCompoundList,
    locStart: Location,
  ) => NodeFor;

  functionDefinition: (
    name: NodeName,
    body: [NodeCompoundList, NodeRedirect[] | undefined],
  ) => NodeFunction;

  elseClause: (
    compoundList: NodeCompoundList,
    elseClaus: NodeElse,
  ) => NodeCompoundList;

  ifClause: (
    clause: NodeCompoundList,
    then: NodeCompoundList,
    elseBranch: NodeCompoundList,
    locStart: Location,
    locEnd: Location,
  ) => NodeIf;

  while: (
    clause: NodeCompoundList,
    body: NodeCompoundList,
    whileWord: NodeWord,
  ) => NodeWhile;

  until: (
    clause: NodeCompoundList,
    body: NodeCompoundList,
    whileWord: NodeWord,
  ) => NodeUntil;

  commandName: (
    name: NodeName,
  ) => NodeName;

  commandAssignment: (
    prefix: NodeCommandPrefix,
  ) => NodeCommand;

  command: (
    prefix: NodeCommandPrefix,
    command?: NodeName,
    suffix?: NodeCommandSuffix,
  ) => NodeCommand;

  ioRedirect: (
    op: NodeWord,
    file: NodeWord,
  ) => NodeRedirect;

  numberIoRedirect: (
    ioRedirect: NodeRedirect,
    numberIo: NodeIoNumber,
  ) => NodeRedirect;

  suffix: (
    item: NodeWord,
  ) => NodeWord[];

  suffixAppend: (
    list: NodeWord[],
    item: NodeWord,
  ) => NodeWord[];

  prefix: (
    item: NodeAssignmentWord | NodeRedirect,
  ) => Array<NodeAssignmentWord | NodeRedirect>;

  prefixAppend: (
    list: Node[],
    item: NodeAssignmentWord | NodeRedirect,
  ) => Node[];

  caseList: (
    item: NodeCaseItem,
  ) => NodeCaseItem[];

  caseListAppend: (
    list: NodeCaseItem[],
    item: NodeCaseItem,
  ) => NodeCaseItem[];

  pattern: (
    item: NodeWord,
  ) => NodeWord[];

  patternAppend: (
    list: NodeWord[],
    item: NodeWord,
  ) => NodeWord[];
};

// TODO: This checks nothing... improve!
export type ParameterOp = {
  [key in string]: ((m: RegExpMatchArray) => string | number | boolean | undefined) | string | string[];
};
