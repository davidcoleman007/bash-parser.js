import { LexerPhase } from '~/lexer/types.ts';
import { TokenIf } from '~/tokenizer/mod.ts';
import compose from '~/utils/compose.ts';
import isValidName from '~/utils/is-valid-name.ts';
import lookahead, { type LookaheadIterable } from '~/utils/iterable/lookahead.ts';
import map from '~/utils/iterable/map.ts';

const forNameVariable: LexerPhase = () => {
  return compose<TokenIf>(
    map((tk: TokenIf, _idx, iterable) => {
      const it = iterable as LookaheadIterable<TokenIf>;
      const lastToken = it.behind(1) || { is: () => false };

      // if last token is For and current token form a valid name
      // type of token is changed from WORD to NAME

      if (lastToken.is('For') && tk.is('WORD') && isValidName(tk.value!)) {
        return tk.changeTokenType('NAME', tk.value!);
      }

      return tk;
    }),
    lookahead,
  );
};

export default forNameVariable;
