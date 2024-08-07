import { LexerPhase } from '~/lexer/types.ts';
import { applyTokenizerVisitor, changeTokenType, mkToken, TokenIf } from '~/tokenizer/mod.ts';
import compose from '~/utils/compose.ts';
import lookahead, { type LookaheadIterable } from '~/utils/iterable/lookahead.ts';
import map from '~/utils/iterable/map.ts';
import filterNonNull from '~/utils/non-null.ts';

const SkipRepeatedNewLines = {
  NEWLINE(tk: TokenIf, iterable: LookaheadIterable<TokenIf>) {
    const lastToken = iterable.behind(1) || mkToken('EMPTY');

    if (lastToken.is('NEWLINE')) {
      return null;
    }

    return changeTokenType(tk, 'NEWLINE_LIST', '\n');
  },
};

/* resolve a conflict in grammar by tokenize multiple NEWLINEs as a
newline_list token (it was a rule in POSIX grammar) */
const newLineList: LexerPhase = () =>
  compose<TokenIf>(
    filterNonNull,
    map(
      applyTokenizerVisitor(SkipRepeatedNewLines),
    ),
    lookahead,
  );

export default newLineList;
