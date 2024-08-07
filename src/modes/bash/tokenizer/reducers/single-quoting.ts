import type { Reducer } from '~/types.ts';
import { continueToken, tokenOrEmpty } from '~/utils/tokens.ts';

const singleQuoting: Reducer = (state, source, reducers) => {
  const char = source && source.shift();

  if (char === undefined) {
    return {
      nextState: state,
      nextReduction: null,
      tokensToEmit: tokenOrEmpty(state).concat(continueToken("'")),
    };
  }

  if (char === "'") {
    return {
      nextReduction: reducers.start,
      nextState: state.appendChar(char),
    };
  }

  return {
    nextReduction: reducers.singleQuoting,
    nextState: state.appendChar(char),
  };
};

export default singleQuoting;
