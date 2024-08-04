import lookahead from 'iterable-lookahead';
import map from 'map-iterable';
import { LexerPhase } from '~/types.ts';
import compose from '~/utils/compose.ts';

const functionName: LexerPhase = () => {
  return compose(
    map((tk, idx, iterable) => {
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
        iterable.ahead(2) &&
        iterable.ahead(1).is('OPEN_PAREN') &&
        iterable.ahead(2).is('CLOSE_PAREN')
      ) {
        tk = tk.changeTokenType('NAME', tk.value);
      }

      return tk;
    }),
    lookahead.depth(2),
  );
};

export default functionName;
