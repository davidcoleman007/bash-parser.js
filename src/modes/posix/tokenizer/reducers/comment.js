

import { newLine } from '../../../../utils/tokens.js';

export default function comment(state, source, reducers) {
	const char = source && source.shift();

	if (char === undefined) {
		return {
			nextReduction: reducers.end,
			nextState: state
		};
	}

	if (char === '\n') {
		return {
			tokensToEmit: [newLine()],
			nextReduction: reducers.start,
			nextState: state
		};
	}

	return {
		nextReduction: comment,
		nextState: state
	};
};
