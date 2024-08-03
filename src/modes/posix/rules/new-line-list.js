
import compose from '../../../utils/compose.js';
import map from 'map-iterable';
import lookahead from 'iterable-lookahead';
import tokens from '../../../utils/tokens.js';
import filterNonNull from '../../../utils/non-null.js';

const SkipRepeatedNewLines = {
	NEWLINE(tk, iterable) {
		const lastToken = iterable.behind(1) || tokens.mkToken('EMPTY');

		if (lastToken.is('NEWLINE')) {
			return null;
		}

		return tokens.changeTokenType(tk, 'NEWLINE_LIST', '\n');
	}
};

/* resolve a conflict in grammar by tokenize multiple NEWLINEs as a
newline_list token (it was a rule in POSIX grammar) */
export default () => compose(
	filterNonNull,
	map(
		tokens.applyTokenizerVisitor(SkipRepeatedNewLines)
	),
	lookahead
);

