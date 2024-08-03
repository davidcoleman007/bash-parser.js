

import { eof } from '../../../../utils/tokens.js';

export default function end() {
	return {
		nextReduction: null,
		tokensToEmit: [eof()]
	};
};
