import { LexerPhase } from '~/lexer/types.ts';
import { TokenIf } from '~/tokenizer/types.ts';
import map from '~/utils/iterable/map.ts';

const convertToWord: LexerPhase = () =>
  map((tk: TokenIf) => {
    // TOKEN tokens are converted to WORD tokens
    if (tk.is('TOKEN')) {
      return tk.changeTokenType('WORD', tk.value!);
    }

    // other tokens are amitted as-is
    return tk;
  });

export default convertToWord;
