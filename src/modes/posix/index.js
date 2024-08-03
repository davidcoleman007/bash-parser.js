

import astBuilder from './ast-builder.js';
import tokenizer from './tokenizer/index.js';
import phaseCatalog from './rules/index.js';
import grammarSource from './grammar.js';
import enums from './enums/index.js';

const lexerPhases = () => [
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
	phaseCatalog.parameterExpansion.resolve,
	phaseCatalog.commandExpansion.resolve,
	phaseCatalog.arithmeticExpansion.resolve,
	phaseCatalog.fieldSplitting.split,
	phaseCatalog.pathExpansion,
	phaseCatalog.quoteRemoval,
	phaseCatalog.syntaxerrorOnContinue,
	phaseCatalog.defaultNodeType
	// utils.loggerPhase('tokenizer'),
];

import * as grammar from './built-grammar.js';

export default {
	inherits: null,
	init: (posixMode, utils) => {
		// let grammar = null;
		// try {
		// 	grammar = import('./built-grammar.js');
		// } catch (err) {
		// 	console.error('Error loading grammar:', err);
		// }
		return {
			enums,
			phaseCatalog,
			lexerPhases: lexerPhases(utils),
			tokenizer,
			grammarSource,
			grammar,
			astBuilder
		};
	}
};
