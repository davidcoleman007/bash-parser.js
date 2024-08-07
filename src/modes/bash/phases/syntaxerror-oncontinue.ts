import { LexerPhase } from '~/lexer/types.ts';
import { TokenIf } from '~/tokenizer/mod.ts';
import map from '~/utils/iterable/map.ts';

const syntaxerrorOnContinue: LexerPhase = () => {
  return map((tk: TokenIf) => {
    if (tk && tk.is('CONTINUE')) {
      throw new SyntaxError('Unclosed ' + tk.value);
    }

    return tk;
  });
};

export default syntaxerrorOnContinue;
