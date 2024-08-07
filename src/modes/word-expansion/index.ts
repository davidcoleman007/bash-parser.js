import type { LexerPhase, ModePlugin, Reducer, TokenIf } from '~/types.ts';
import map from '~/utils/iterable/map.ts';
import { tokenOrEmpty } from '~/utils/tokens.ts';
import reducers from '../bash/tokenizer/reducers/mod.ts';

const convertToWord: LexerPhase = () =>
  map((tk: TokenIf) => {
    // TOKEN tokens are converted to WORD tokens
    if (tk.is('TOKEN')) {
      return tk.changeTokenType('WORD', tk.value!);
    }

    // other tokens are amitted as-is
    return tk;
  });

const start: Reducer = (state, source, reducers) => {
  const char = source && source.shift();

  if (char === undefined) {
    return {
      nextReduction: reducers.end,
      tokensToEmit: tokenOrEmpty(state),
      nextState: state.resetCurrent().saveCurrentLocAsStart(),
    };
  }

  if (state.escaping && char === '\n') {
    return {
      nextReduction: reducers.start,
      nextState: state.setEscaping(false).removeLastChar(),
    };
  }

  if (!state.escaping && char === '\\') {
    return {
      nextReduction: reducers.start,
      nextState: state.setEscaping(true).appendChar(char),
    };
  }

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

const mode: ModePlugin = {
  inherits: 'bash',
  init: (parentMode) => {
    const lexerPhases = [
      convertToWord,
      parentMode!.phaseCatalog.parameterExpansion,
      parentMode!.phaseCatalog.arithmeticExpansion,
      parentMode!.phaseCatalog.commandExpansion,
      parentMode!.phaseCatalog.tildeExpanding,
      parentMode!.phaseCatalog.parameterExpansionResolve,
      parentMode!.phaseCatalog.commandExpansionResolve,
      parentMode!.phaseCatalog.arithmeticExpansionResolve,
      parentMode!.phaseCatalog.fieldSplitting,
      parentMode!.phaseCatalog.pathExpansion,
      parentMode!.phaseCatalog.quoteRemoval,
      parentMode!.phaseCatalog.defaultNodeType,
    ];

    const tokenizer = () => parentMode!.tokenizer({ ...reducers, start });

    return {
      ...parentMode!,
      lexerPhases,
      tokenizer,
    };
  },
};

export default mode;
