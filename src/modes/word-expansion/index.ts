import map from 'map-iterable';
import type { LexerPhase, ModePlugin, Reducer, Token } from '~/types.ts';
import { tokenOrEmpty } from '~/utils/tokens.ts';
import reducers from '../posix/tokenizer/reducers/mod.ts';

const convertToWord: LexerPhase = () =>
	map((tk: Token) => {
		// TOKEN tokens are converted to WORD tokens
		if (tk.is('TOKEN')) {
			return tk.changeTokenType('WORD', tk.value);
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
	inherits: 'posix',
	init: (_, posixMode) => {
		const phaseCatalog = posixMode!.phaseCatalog;
		const lexerPhases = [
			convertToWord,
			phaseCatalog.parameterExpansion,
			phaseCatalog.arithmeticExpansion,
			phaseCatalog.commandExpansion,
			phaseCatalog.tildeExpanding,
			phaseCatalog.parameterExpansionResolve,
			phaseCatalog.commandExpansionResolve,
			phaseCatalog.arithmeticExpansionResolve,
			phaseCatalog.fieldSplitting,
			phaseCatalog.pathExpansion,
			phaseCatalog.quoteRemoval,
			phaseCatalog.defaultNodeType,
		];
		const customReducers = { ...reducers, start };

		const tokenizer = () => posixMode!.tokenizer(customReducers);

		return Object.assign({}, posixMode, { lexerPhases, tokenizer });
	},
};

export default mode;
