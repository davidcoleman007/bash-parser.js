import last from '~/utils/last.ts';
import type { Expansion, Reducer, ReducerLocation, Reducers, ReducerStateIf } from './types.ts';

class State implements ReducerStateIf {
	current = '';
	escaping = false;
	expansion: Expansion[] = []; // TODO;
	previousReducer: Reducer;
	loc: ReducerLocation;

	constructor(reducers: Reducers) {
		this.previousReducer = reducers.start;
		this.loc = {
			start: { col: 1, row: 1, char: 0 },
			previous: null,
			current: { col: 1, row: 1, char: 0 },
		};
	}

	setLoc(loc: ReducerLocation) {
		this.loc = loc;
		return this;
	}

	setEscaping(escaping: boolean) {
		this.escaping = escaping;
		return this;
	}

	setExpansion(expansion: Expansion[]) {
		this.expansion = expansion;
		return this;
	}

	setPreviousReducer(previousReducer: Reducer) {
		this.previousReducer = previousReducer;
		return this;
	}

	setCurrent(current: string) {
		this.current = current;
		return this;
	}

	appendEmptyExpansion() {
		this.expansion = this.expansion || [];
		this.expansion.push({
			loc: { start: { ...this.loc.current } },
		});
		return this;
	}

	appendChar(char: string) {
		this.current = this.current + char;
		return this;
	}

	removeLastChar() {
		this.current = this.current.slice(0, -1);
		return this;
	}

	saveCurrentLocAsStart() {
		this.loc.start = { ...this.loc.current };
		return this;
	}

	resetCurrent() {
		this.current = '';
		return this;
	}

	replaceLastExpansion(fields: Partial<Expansion>) {
		const xp = last(this.expansion);
		Object.assign(xp!, fields);
		return this;
	}

	deleteLastExpansionValue() {
		const xp = last(this.expansion);
		delete xp!.value;
		return this;
	}

	advanceLoc(char: string) {
		const loc = structuredClone(this.loc);
		loc.previous = { ...this.loc.current };

		if (char === '\n') {
			loc.current!.row!++;
			loc.current!.col = 1;
		} else {
			loc.current!.col!++;
		}

		loc.current!.char!++;

		if (char && char.match(/\s/) && this.current === '') {
			loc.start = { ...loc.current };
		}

		return this.setLoc(loc);
	}
}

/**
 * A function that receives reducers and returns another function that, given shell source code, returns an iterable of parsed tokens.
 *
 * @returns A function that takes shell source code and returns an iterable of parsed tokens.
 */
export const tokenize = (r: Reducers) => (function* tokenizer(src: string) {
	let state = new State(r);

	let reduction = r.start;
	const source = Array.from(src);

	while (typeof reduction === 'function') {
		const char = source[0];
		const reducerdState = reduction(state, source, r);
		const nextReduction = reducerdState.nextReduction;
		const tokensToEmit = reducerdState.tokensToEmit;
		const nextState = reducerdState.nextState;
		if (tokensToEmit) {
			yield* tokensToEmit;
		}

		if (nextState) {
			state = nextState.advanceLoc(char);
		} else {
			state = state.advanceLoc(char);
		}

		reduction = nextReduction!;
	}
});
