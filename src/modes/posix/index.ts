import * as grammar from 'grammar';
import type { LexerPhase, Mode, ModePlugin } from '~/types.ts';
import astBuilder from './ast-builder.ts';
import enums from './enums/index.ts';
import phaseCatalog from './rules/mod.ts';
import tokenizer from './tokenizer/index.ts';

const mode: ModePlugin = {
	init: () => {
		const lexerPhases: LexerPhase[] = [
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
			// utils.loggerPhase('pre'),
			phaseCatalog.aliasSubstitution,
			// utils.loggerPhase('post'),
			phaseCatalog.tildeExpanding,
			phaseCatalog.parameterExpansionResolve,
			phaseCatalog.commandExpansionResolve,
			phaseCatalog.arithmeticExpansionResolve,
			phaseCatalog.fieldSplitting,
			phaseCatalog.pathExpansion,
			phaseCatalog.quoteRemoval,
			phaseCatalog.syntaxerrorOnContinue,
			phaseCatalog.defaultNodeType,
			// utils.loggerPhase('tokenizer'),
		];

		return {
			enums,
			phaseCatalog,
			lexerPhases,
			tokenizer,
			grammar,
			astBuilder,
		} as Mode;
	},
};

export default mode;
