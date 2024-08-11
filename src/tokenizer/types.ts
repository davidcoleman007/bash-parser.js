import type { AstNodeScript } from '~/ast/types.ts';

export type TokenContext = {
  maybeStartOfSimpleCommand?: boolean;
  commandNameNotFoundYet?: boolean;
  joinedToSeparator?: boolean;
  maybeSimpleCommandName?: boolean;
  originalType?: string;
};

export type TokenPosition = {
  row: number;
  col: number;
  char: number;
};

export type TokenLocation = {
  start: ReducerPosition;
  end: ReducerPosition;
};

export type TokenFields = {
  type: string;
  ctx: TokenContext;
  value: string;

  loc?: TokenLocation;
  expansion?: Expansion[];
  joined?: string;
  fieldIdx?: number;
  originalText?: string;
};

export type TokenIf = TokenFields & {
  is(type: string): boolean;
  appendValue(chunk: string): TokenIf;
  setType(type: string): TokenIf;
  setValue(value: string): TokenIf;
  alterValue(value: string): TokenIf;
  setExpansion(expansion: Expansion[]): TokenIf;
};

export type Tokenizer = (code: string) => AsyncIterable<TokenIf>;

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

  tokenOrEmpty(): TokenIf[];
  operatorTokens(): TokenIf[];

  isPartOfOperator(text: string): boolean;
  isOperator(): boolean;
}

export type Reducer = (state: ReducerStateIf, source: string[], reducers: Reducers) => ReducerNextState;

export type ReducerNextState = {
  tokensToEmit?: TokenIf[];
  nextReduction: Reducer | null;
  nextState?: ReducerStateIf;
};
export type Reducers = Record<string, Reducer>;

export type ReducerPosition = {
  row?: number;
  col?: number;
  char?: number;
};

export type ReducerLocation = {
  start: ReducerPosition;
  end?: ReducerPosition;
  previous?: ReducerPosition | null;
  current?: ReducerPosition;
};

export type ExpansionLocation = {
  start: number;
  end: number;
};

// TODO: This type needs work
export type Expansion = {
  parameter?: string;

  command?: string;
  commandAST?: AstNodeScript;

  expression?: string;
  arithmeticAST?: any;

  value?: string;
  type?: string;
  resolved?: boolean;
  loc?: ExpansionLocation;
};

export type Visitor = {
  [key: string]: (tk: TokenIf, iterable?: AsyncIterable<TokenIf>) => Promise<TokenIf[] | TokenIf | null>;
};
