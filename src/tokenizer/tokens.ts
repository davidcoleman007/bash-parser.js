import operators from '~/modes/bash/enums/operators.ts';
import type { Expansion, ReducerLocation, ReducerStateIf, TokenIf, Visitor } from './types.ts';

export class Token implements TokenIf {
	type: string = '';
	// value: string | undefined;
	// joined: string | undefined;
	// fieldIdx: number | undefined;
	// loc: Location = { start: {}, end: {} };
	// expansion: Expansion[] | undefined;
	// originalText: string | undefined;
	// originalType: string | undefined;
	_: Record<string, any> = {};

	constructor(fields: Partial<TokenIf>) {
		const definedFields = Object.fromEntries(
			Object.entries(fields).filter(([_, value]) => value !== undefined),
		);
		Object.assign(this, definedFields);

		if (this._ === undefined) {
			this._ = {};
		}
	}

	is(type: string) {
		return this.type === type;
	}

	appendTo(chunk: string): TokenIf {
		return new Token(Object.assign({}, this, { value: this.value + chunk }));
	}

	changeTokenType(type: string, value: string) {
		return new Token({ type, value, loc: this.loc, _: this._, expansion: this.expansion });
	}

	setValue(value: string) {
		return new Token(Object.assign({}, this, { value }));
	}

	alterValue(value: string) {
		return new Token(Object.assign({}, this, { value, originalText: this.originalText || this.value }));
	}

	addExpansions() {
		return new Token(Object.assign({}, this, { expansion: [] }));
	}

	setExpansions(expansion: Expansion[]) {
		return new Token(Object.assign({}, this, { expansion }));
	}
}

export const token = (args: Partial<TokenIf>) => new Token(args);

export function mkToken(type: string, value?: string, loc?: ReducerLocation, expansion?: Expansion[]) {
	const tk = new Token({ type, value, loc });
	if (expansion && expansion.length) {
		tk.expansion = expansion;
	}

	return tk;
}

export const mkFieldSplitToken = (joinedTk: TokenIf, value: string, fieldIdx: number) => {
	const tk = new Token({
		type: joinedTk.type,
		value,
		joined: joinedTk.value,
		fieldIdx,
		loc: joinedTk.loc,
		expansion: joinedTk.expansion,
		originalText: joinedTk.originalText,
	});

	return tk;
};

export const appendTo = (tk: TokenIf, chunk: string) => tk.appendTo(chunk);
export const changeTokenType = (tk: TokenIf, type: string, value: string) => tk.changeTokenType(type, value);
export const setValue = (tk: TokenIf, value: string) => tk.setValue(value);
export const alterValue = (tk: TokenIf, value: string) => tk.alterValue(value);
export const addExpansions = (tk: TokenIf) => tk.addExpansions();
export const setExpansions = (tk: TokenIf, expansion: Expansion[]) => tk.setExpansions(expansion);

export const tokenOrEmpty = (state: ReducerStateIf) => {
	if (state.current !== '' && state.current !== '\n') {
		const expansion = (state.expansion || []).map((xp) => {
			// console.log('aaa', {token: state.loc, xp: xp.loc});
			return Object.assign({}, xp, {
				loc: {
					start: xp.loc!.start!.char! - state.loc.start!.char!,
					end: xp.loc!.end!.char! - state.loc.start!.char!,
				},
			});
		});
		const token = mkToken('TOKEN', state.current, {
			start: Object.assign({}, state.loc.start),
			end: Object.assign({}, state.loc.previous),
		}, expansion);

		/* if (state.expansion && state.expansion.length) {
			token.expansion = state.expansion;
		}*/

		return [token];
	}
	return [];
};

export const operatorTokens = (state: ReducerStateIf) => {
	const token = mkToken(
		operators[state.current as keyof typeof operators],
		state.current,
		{
			start: Object.assign({}, state.loc.start),
			end: Object.assign({}, state.loc.previous),
		},
	);

	return [token];
};

export const newLine = () => {
	return mkToken('NEWLINE', '\n');
};

export const continueToken = (expectedChar: string) => {
	return mkToken('CONTINUE', expectedChar);
};

export const eof = () => {
	return mkToken('EOF', '');
};

export const isPartOfOperator = (text: string) => {
	return Object.keys(operators).some((op) => op.slice(0, text.length) === text);
};

export const isOperator = (text: string) => {
	return text in operators;
};

export const applyTokenizerVisitor = (visitor: Visitor) => (tk: TokenIf, _idx: number, iterable: Iterable<TokenIf>) => {
	if (tk.type in visitor) {
		const visit = visitor[tk.type];

		return visit(tk, iterable);
	}

	if ('defaultMethod' in visitor) {
		const visit = visitor.defaultMethod;
		return visit(tk, iterable);
	}

	return tk;
};
