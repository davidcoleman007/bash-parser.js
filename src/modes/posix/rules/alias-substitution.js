

import compose from '../../../utils/compose.js';
import map from 'map-iterable';
import merge from 'transform-spread-iterable';
import tokens from '../../../utils/tokens.js';

const expandAlias = (preAliasLexer, resolveAlias) => {
	function * tryExpandToken(token, expandingAliases) {
		if (expandingAliases.indexOf(token.value) !== -1 || !token._.maybeSimpleCommandName) {
			yield token;
			return;
		}

		const result = resolveAlias(token.value);
		if (result === undefined) {
			yield token;
		} else {
			for (const newToken of preAliasLexer(result)) {
				if (newToken.is('WORD')) {
					yield * tryExpandToken(
						newToken,
						expandingAliases.concat(token.value)
					);
				} else if (!newToken.is('EOF')) {
					yield newToken;
				}
			}
		}
	}

	return {
		WORD: tk => {
			return Array.from(tryExpandToken(tk, []));
		}
	};
};

export default (options, mode, previousPhases) => {
	if (typeof options.resolveAlias !== 'function') {
		return (x) => x;
	}

	const preAliasLexer = compose.apply(null, previousPhases.reverse());
	const visitor = expandAlias(preAliasLexer, options.resolveAlias);

	return compose(
		merge,
		map(
			tokens.applyTokenizerVisitor(visitor)
		)
	);
};
