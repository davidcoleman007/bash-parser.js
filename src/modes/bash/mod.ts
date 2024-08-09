import type { ModePlugin } from '~/modes/types.ts';
import enums from './enums/mod.ts';
import phaseCatalog from './phases/mod.ts';
import reducers from './reducers/mod.ts';

const mode: ModePlugin = {
  init: () => {
    return {
      enums,
      phaseCatalog,
      lexerPhases: [
        phaseCatalog.newLineList,
        phaseCatalog.operatorTokens,
        phaseCatalog.separator,
        phaseCatalog.reservedWords,
        phaseCatalog.linebreakIn,
        phaseCatalog.ioNumber,
        phaseCatalog.identifyMaybeSimpleCommands,
        phaseCatalog.assignmentWord,
        phaseCatalog.parameterExpansion,
        phaseCatalog.arithmeticExpansion,
        phaseCatalog.commandExpansion,
        phaseCatalog.forNameVariable,
        phaseCatalog.functionName,
        phaseCatalog.identifySimpleCommandNames,
        // loggerPhase('pre'),
        phaseCatalog.aliasSubstitution,
        // loggerPhase('post'),
        phaseCatalog.tildeExpanding,
        phaseCatalog.parameterExpansionResolve,
        phaseCatalog.commandExpansionResolve,
        phaseCatalog.arithmeticExpansionResolve,
        phaseCatalog.fieldSplitting,
        phaseCatalog.pathExpansion,
        phaseCatalog.quoteRemoval,
        phaseCatalog.syntaxerrorOnContinue,
        phaseCatalog.defaultNodeType,
        // loggerPhase('tokenizer'),
      ],
      reducers,
    };
  },
};

export default mode;
