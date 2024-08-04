import map from 'map-iterable';
import { LexerPhase } from '~/types.ts';

const syntaxerrorOnContinue: LexerPhase = () => {
	return map((tk) => {
		if (tk && tk.is('CONTINUE')) {
			throw new SyntaxError('Unclosed ' + tk.value);
		}

		return tk;
	});
};

export default syntaxerrorOnContinue;
