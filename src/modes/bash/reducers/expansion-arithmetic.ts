import { continueToken } from '~/tokenizer/tokens.ts';
import type { Reducer } from '~/tokenizer/types.ts';
import last from '~/utils/last.ts';

const expansionArithmetic: Reducer = (state, source) => {
  const char = source && source.shift();

  const xp = last(state.expansion);

  if (char === ')' && state.current.slice(-1)[0] === ')') {
    return {
      nextReduction: state.previousReducer,
      nextState: state
        .appendChar(char)
        .replaceLastExpansion({
          type: 'arithmetic_expansion',
          expression: xp!.value!.slice(0, -1),
          loc: Object.assign({}, xp!.loc, { end: state.loc.current }),
        })
        .deleteLastExpansionValue(),
    };
  }

  if (char === undefined) {
    return {
      nextReduction: state.previousReducer,
      tokensToEmit: [continueToken('$((')],
      nextState: state.replaceLastExpansion({
        loc: Object.assign({}, xp!.loc, { end: state.loc.previous }),
      }),
    };
  }

  return {
    nextReduction: expansionArithmetic,
    nextState: state.appendChar(char).replaceLastExpansion({ value: (xp?.value || '') + char }),
  };
};

export default expansionArithmetic;
