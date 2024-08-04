export type Token = object;

/**
 * `LexerPhase` functions are applied, in order, to the iterable returned from the `tokenizer` function. Each phase enhances or alters the tokens to produce a final token iterable, directly consumable by the grammar parser.
 *
 * Each phase is a function that accepts as arguments the parser option object,
 * an array of all phases that precede it in the pipeline, and the utils object. The function shall return another function that receives as argument the iterable produced by the previous phase, and returns the iterable to give to the subsequent one.
 */
export type LexerPhase = (options: object, previousPhases: LexerPhase[], utils: object) => (tokens: Iterable<Token>) => Iterable<Token>;

/**
 * A mode could optionally inherit an existing one. It specifies the mode to inherit in its
 * `inherits` property. If it does, the `init` function will receive as argument the inherited mode. In this way, the child mode could use the parent mode features.
 *
 * The `init` function must return a `Mode` object.
 */
export type Mode = {
  /**
   * A function that receives parser options and utils object as arguments, and returns another function that, given shell source code, returns an iterable of parsed tokens.
   */
  tokenizer: (options: object, utils: object) => (code: string) => Iterable<Token>;

  /**
   * An array of transform functions that are applied, in order, to the iterable of tokens returned by the `tokenizer` function. Each phase must have the `LexerPhase` type described below.
   */
  lexerPhases: LexerPhase[];

  /**
   * A named map of all phases contained in the array. This could be used by children modes to access each phase by name and reuse them.
   */
  phaseCatalog: { [id: string]: LexerPhase };

  /**
   * The grammar compiled function. This is usually imported from a Jison grammar, built using the `builder` CLI.
   */
  grammar: object;

  /**
   * An object containing methods to build the final AST. This object is mixed-in in the Jison grammar, and any of its methods could be called directly from grammar EBNF source.
   */
  astBuilder: object;
};

/**
 * A mode plugin consists of a module in the `src/modes` folder. The module must export
 * a `ModePlugin` object with an optional `inherits` property and a required `init` factory function.
 */
export type ModePlugin = {
  /**
   * A mode could optionally inherit an existing one. If it does inherit, the `init` function will receive as argument the inherited mode. In this way, the child mode could use the parent mode features.
   */
  inherits?: string;

  /**
   * A factory function that receives the parent mode as argument and returns a `Mode` object.
   */
  init: (parentMode: Mode) => Mode;
};
