import { LexerPhase } from '~/lexer/types.ts';
import { TokenIf } from '~/tokenizer/mod.ts';
import compose from '~/utils/compose.ts';
import lookahead, { type LookaheadIterable } from '~/utils/iterable/lookahead.ts';
import map from '~/utils/iterable/map.ts';

const functionName: LexerPhase = () => {
  return compose<TokenIf>(
    map((tk: TokenIf, _idx, iterable) => {
      const it = iterable as LookaheadIterable<TokenIf>;
      // apply only on valitd positions
      // (start of simple commands)
      // if token can form the name of a function,
      // type of token is changed from WORD to NAME

      /* console.log(
            tk._.maybeStartOfSimpleCommand,
            tk.is('WORD'),
            iterable.ahead(1) &&
                iterable.ahead(1).is('OPEN_PAREN'),
            iterable.ahead(2) &&
                iterable.ahead(2).is('CLOSE_PAREN')
        );*/

      if (
        tk._.maybeStartOfSimpleCommand &&
        tk.is('WORD') &&
        it.ahead(2) &&
        it.ahead(1)!.is('OPEN_PAREN') &&
        it.ahead(2)!.is('CLOSE_PAREN')
      ) {
        tk = tk.changeTokenType('NAME', tk.value!);
      }

      return tk;
    }),
    lookahead.depth(2),
  );
};

export default functionName;
