import type { LexerIf } from '~/grammar/mod.ts';
import type { LexerContext, LexerPhaseFn } from '~/lexer/types.ts';
import type { Mode } from '~/modes/types.ts';
import { type TokenIf, tokenize, type Tokenizer } from '~/tokenizer/mod.ts';
import type { Options } from '~/types.ts';
import compose from '~/utils/compose.ts';

export class Lexer implements LexerIf {
  private tokenizer: Tokenizer;
  private tokens?: Iterable<TokenIf>;
  private insertLOC: boolean;
  public yytext?: any;
  public yylineno: number = 0;

  constructor(mode: Mode, options: Options) {
    const tokenizerPhase: LexerPhaseFn = tokenize(mode.reducers);

    let previousPhases: LexerPhaseFn[] = [
      tokenizerPhase,
    ];

    const phases = [
      tokenizerPhase,
      ...mode.lexerPhases.map((phase) => {
        const ctx: LexerContext = {
          resolvers: options,
          enums: mode.enums,
          previousPhases,
        };

        const ph = phase(ctx);
        previousPhases = [...previousPhases, ph];
        return ph;
      }),
    ];

    this.tokenizer = compose<TokenIf>(...phases.reverse());
    this.insertLOC = !!options.insertLOC;
  }

  setInput(source: string) {
    this.tokens = this.tokenizer(source);
  }

  lex() {
    const iterator = this.tokens![Symbol.iterator]();
    const item = iterator.next();

    const tk: TokenIf = item.value;

    const tkType = tk.ctx.originalType;
    const text = tk.value;

    this.yytext = { text, type: '' };
    if (tk.expansion) {
      this.yytext.expansion = tk.expansion;
    }

    if (tk.type) {
      this.yytext.type = tk.type;
    }

    if (tk.originalText) {
      this.yytext.originalText = tk.originalText;
    }

    if (tk.joined) {
      this.yytext.joined = tk.joined;
    }

    if (tk.fieldIdx !== undefined) {
      this.yytext.fieldIdx = tk.fieldIdx;
    }

    if (this.insertLOC && tk.loc) {
      this.yytext.loc = tk.loc;
    }

    if (tk.loc) {
      this.yylineno = tk.loc.start.row! - 1;
    }

    return tkType;
  }
}
