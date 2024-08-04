import type { Reducer } from '~/types.ts';
import { eof } from '~/utils/tokens.ts';

const end: Reducer = () => {
	return {
		nextReduction: null,
		tokensToEmit: [eof()],
	};
};

export default end;
