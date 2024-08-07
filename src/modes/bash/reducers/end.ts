import { eof } from '~/tokenizer/tokens.ts';
import type { Reducer } from '~/tokenizer/types.ts';

const end: Reducer = () => {
  return {
    nextReduction: null,
    tokensToEmit: [eof()],
  };
};

export default end;
