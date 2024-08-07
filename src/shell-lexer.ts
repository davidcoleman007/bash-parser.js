import type { LexerIf, LexerPhaseFn, Mode, Options, TokenIf } from '~/types.ts';
import compose from '~/utils/compose.ts';

class ShellLexer implements LexerIf {
  private mode: Mode;
  private options: Options;
  private tokenizer?: Iterable<TokenIf>;
  public yytext?: any;
  public yylineno: number = 0;

  constructor(mode: Mode, options: Options) {
    this.mode = mode;
    this.options = options;
  }

  setInput(source: string) {
    const tokenizer = this.mode.tokenizer();

    let previousPhases: LexerPhaseFn[] = [
      tokenizer,
    ];

    const phases = [
      tokenizer,
      ...this.mode.lexerPhases.map((phase) => {
        const ph = phase(this.options, this.mode, previousPhases);
        previousPhases = [...previousPhases, ph];
        return ph;
      }),
    ];

    const tokenize = compose(...phases.reverse());
    this.tokenizer = tokenize(source);
  }

  lex() {
    const iterator = this.tokenizer![Symbol.iterator]();
    const item = iterator.next();

    const tk: TokenIf = item.value;
    const tkType = tk.originalType;
    const text = tk.value;

    this.yytext = { text, type: '' };
    if (tk.expansion) {
      this.yytext.expansion = tk.expansion;
    }

    if (tk.originalText) {
      this.yytext.originalText = tk.originalText;
    }

    if (tk.type) {
      this.yytext.type = tk.type;
    }

    if (tk.maybeSimpleCommandName) {
      this.yytext.maybeSimpleCommandName = tk.maybeSimpleCommandName;
    }

    if (tk.joined) {
      this.yytext.joined = tk.joined;
    }

    if (tk.fieldIdx !== undefined) {
      this.yytext.fieldIdx = tk.fieldIdx;
    }

    if (this.options.insertLOC && tk.loc) {
      this.yytext.loc = tk.loc;
    }

    if (tk.loc) {
      this.yylineno = tk.loc.start.row! - 1;
    }

    return tkType;
  }
}

const shellLexer = (mode: Mode, options: Options) => {
  return new ShellLexer(mode, options);
};

export default shellLexer;
