import map from 'map-iterable';
import fieldSplittingMark from '~/modes/posix/rules/lib/field-splitting-mark.ts';
import { LexerPhase } from '~/types.ts';
import overwriteInString from '~/utils/overwrite-in-string.ts';
import tokens from '~/utils/tokens.ts';

const parameterExpansionResolve: LexerPhase = (options) =>
	map((token) => {
		if (token.is('WORD') || token.is('ASSIGNMENT_WORD')) {
			if (!options.resolveParameter || !token.expansion || token.expansion.length === 0) {
				return token;
			}

			let value = token.value;

			for (const xp of token.expansion) {
				if (xp.type === 'parameter_expansion') {
					const result = options.resolveParameter(xp);
					xp.resolved = true;
					value = overwriteInString(
						value,
						xp.loc.start,
						xp.loc.end + 1,
						fieldSplittingMark(result, value, options),
					);
				}
			}
			return tokens.alterValue(token, value);
		}
		return token;
	});

export default parameterExpansionResolve;
