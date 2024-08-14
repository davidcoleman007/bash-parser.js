import { mkToken, type Reducer } from '~/tokenizer/mod.ts';

const start: Reducer = (state, source, reducers) => {
  const char = source && source.shift();

  if (char === undefined) {
    return {
      nextReduction: reducers.end,
      tokensToEmit: state.tokenOrEmpty(),
      nextState: state.resetCurrent().saveCurrentLocAsStart(),
    };
  }

  if (state.escaping && char === '\n') {
    return {
      nextReduction: reducers.start,
      nextState: state.setEscaping(false).removeLastChar(),
    };
  }

  if (!state.escaping && char === '#' && state.current === '') {
    return {
      nextReduction: reducers.comment,
    };
  }

  if (!state.escaping && char === '\n') {
    return {
      nextReduction: reducers.start,
      tokensToEmit: state.tokenOrEmpty().concat(mkToken('NEWLINE', '\n')),
      nextState: state.resetCurrent().saveCurrentLocAsStart(),
    };
  }

  if (!state.escaping && char === '\\') {
    return {
      nextReduction: reducers.start,
      nextState: state.setEscaping(true).appendChar(char),
    };
  }

  if (!state.escaping && state.isPartOfOperator(char)) {
    return {
      nextReduction: reducers.operator,
      tokensToEmit: state.tokenOrEmpty(),
      nextState: state.setCurrent(char).saveCurrentLocAsStart(),
    };
  }

  // if (!state.escaping && state.isPartOfOperator(char)) {
  //   console.log('this.current + char', state.current, char);
  //   const opState = state.clone().resetCurrent().saveCurrentLocAsStart().resetExpansion();
  //   console.log('before operator', opState);
  //   const ret = reducers.operator(opState, [char, ...source], reducers);
  //   console.log('after operator tokensToEmit', ret.tokensToEmit);
  //   if (ret.tokensToEmit && ret.tokensToEmit.length > 0) {
  //     console.log('EMIT after opertor');
  //     return {
  //       nextReduction: ret.nextReduction,
  //       tokensToEmit: [...state.tokenOrEmpty(), ...ret.tokensToEmit],
  //       nextState: ret.nextState,
  //     };
  //   }

  //   return {
  //     nextReduction: reducers.start,
  //     nextState: state.appendChar(char),
  //   };
  // }

  if (!state.escaping && char === "'") {
    return {
      nextReduction: reducers.singleQuoting,
      nextState: state.appendChar(char),
    };
  }

  if (!state.escaping && char === '"') {
    return {
      nextReduction: reducers.doubleQuoting,
      nextState: state.appendChar(char),
    };
  }

  if (!state.escaping && char.match(/\s/)) {
    return {
      nextReduction: reducers.start,
      tokensToEmit: state.tokenOrEmpty(),
      nextState: state.resetCurrent().saveCurrentLocAsStart().setExpansion([]),
    };
  }

  if (!state.escaping && char === '$') {
    return {
      nextReduction: reducers.expansionStart,
      nextState: state.appendChar(char).appendEmptyExpansion(),
    };
  }

  if (!state.escaping && char === '`') {
    return {
      nextReduction: reducers.expansionCommandTick,
      nextState: state.appendChar(char).appendEmptyExpansion(),
    };
  }

  return {
    nextReduction: reducers.start,
    nextState: state.appendChar(char).setEscaping(false),
  };
};

export default start;
