import lookahead from 'iterable-lookahead';
import map from 'map-iterable';
import { LexerPhase } from '~/types.ts';
import compose from '~/utils/compose.ts';
import filterNonNull from '~/utils/non-null.ts';
import tokens from '~/utils/tokens.ts';

const SkipRepeatedNewLines = {
	NEWLINE(tk, iterable) {
		const lastToken = iterable.behind(1) || tokens.mkToken('EMPTY');

		if (lastToken.is('NEWLINE')) {
			return null;
		}

		return tokens.changeTokenType(tk, 'NEWLINE_LIST', '\n');
	},
};

/* resolve a conflict in grammar by tokenize multiple NEWLINEs as a
newline_list token (it was a rule in POSIX grammar) */
const newLineList: LexerPhase = () =>
	compose(
		filterNonNull,
		map(
			tokens.applyTokenizerVisitor(SkipRepeatedNewLines),
		),
		lookahead,
	);

export default newLineList;
