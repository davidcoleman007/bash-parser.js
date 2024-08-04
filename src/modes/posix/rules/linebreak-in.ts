import lookahead from 'iterable-lookahead';
import map from 'map-iterable';
import type { LexerPhase, TokenIf } from '~/types.ts';
import compose from '~/utils/compose.ts';
import filterNonNull from '~/utils/non-null.ts';
import tokens from '~/utils/tokens.ts';

const ReplaceWithLineBreakIn = {
  NEWLINE_LIST(tk: TokenIf, iterable) {
    const nextToken = iterable.ahead(1) || tokens.mkToken('EMPTY');

    if (nextToken.is('In')) {
      return tokens.changeTokenType(
        tk,
        'LINEBREAK_IN',
        '\nin',
      );
    }

    return tk;
  },

  In(tk: TokenIf, iterable) {
    const lastToken = iterable.behind(1) || tokens.mkToken('EMPTY');

    if (lastToken.is('NEWLINE_LIST')) {
      return null;
    }

    return tk;
  },
};

/* resolve a conflict in grammar by tokenize linebreak+in
tokens as a new  linebreak_in */
const linebreakIn: LexerPhase = () =>
  compose(
    filterNonNull,
    map(
      tokens.applyTokenizerVisitor(ReplaceWithLineBreakIn),
    ),
    lookahead,
  );

export default linebreakIn;
