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

export type Tokenizer = (code: string) => Iterable<TokenIf>;

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

export type ReducerPosition = {
  row?: number;
  col?: number;
  char?: number;
};

export type ReducerLocation = {
  start: ReducerPosition;
  previous?: ReducerPosition | null;
  current?: ReducerPosition;
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
