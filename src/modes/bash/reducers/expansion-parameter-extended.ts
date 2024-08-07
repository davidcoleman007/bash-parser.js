import { continueToken } from '~/tokenizer/tokens.ts';
import type { Reducer } from '~/tokenizer/types.ts';
import last from '~/utils/last.ts';

const expansionParameterExtended: Reducer = (state, source, reducers) => {
  const char = source && source.shift();

  const xp = last(state.expansion);

  if (char === '}') {
    return {
      nextReduction: state.previousReducer,
      nextState: state.appendChar(char).replaceLastExpansion({
        type: 'parameter_expansion',
        loc: Object.assign({}, xp!.loc, { end: state.loc.current }),
      }),
    };
  }

  if (char === undefined) {
    return {
      nextReduction: state.previousReducer,
      tokensToEmit: [continueToken('${')],
      nextState: state.replaceLastExpansion({
        loc: Object.assign({}, xp!.loc, { end: state.loc.previous }),
      }),
    };
  }

  return {
    nextReduction: reducers.expansionParameterExtended,
    nextState: state
      .appendChar(char)
      .replaceLastExpansion({ parameter: (xp!.parameter || '') + char }),
  };
};

export default expansionParameterExtended;
