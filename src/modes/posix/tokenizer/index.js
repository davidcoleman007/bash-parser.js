
import last from '../../../utils/last.js';
import reducers from './reducers/index.js';

const defaultFields = reducers => ({
	current: '',
	escaping: false,
	previousReducer: reducers.start,
	loc: {
		start: {col: 1, row: 1, char: 0},
		previous: null,
		current: {col: 1, row: 1, char: 0}
	}
});

const mkImmutableState = reducers => (class ImmutableState {
	constructor(fields) {
		Object.assign(this, fields || defaultFields(reducers));
	}

	setLoc(loc) {
		return new ImmutableState(Object.assign({}, this, {loc}));
	}

	setEscaping(escaping) {
		return new ImmutableState(Object.assign({}, this, {escaping}));
	}

	setExpansion(expansion) {
		return new ImmutableState(Object.assign({}, this, {expansion}));
	}

	setPreviousReducer(previousReducer) {
		return new ImmutableState(Object.assign({}, this, {previousReducer}));
	}

	setCurrent(current) {
		return new ImmutableState(Object.assign({}, this, {current}));
	}

	appendEmptyExpansion() {
		const expansion = (this.expansion || []).concat({
			loc: {start: Object.assign({}, this.loc.current)}
		});
		return this.setExpansion(expansion);
	}

	appendChar(char) {
		return new ImmutableState(Object.assign({}, this, {current: this.current + char}));
	}

	removeLastChar() {
		return new ImmutableState(Object.assign({}, this, {current: this.current.slice(0, -1)}));
	}

	saveCurrentLocAsStart() {
		return new ImmutableState(Object.assign({}, this, {loc: Object.assign({}, this.loc, {start: this.loc.current})}));
	}

	resetCurrent() {
		return new ImmutableState(Object.assign({}, this, {current: ''}));
	}

	advanceLoc(char) {
		const loc = Object.assign({},
			this.loc, {
				current: Object.assign({}, this.loc.current),
				previous: Object.assign({}, this.loc.current)
			}
		);

		if (char === '\n') {
			loc.current.row++;
			loc.current.col = 1;
		} else {
			loc.current.col++;
		}

		loc.current.char++;

		if (char && char.match(/\s/) && this.current === '') {
			loc.start = Object.assign({}, loc.current);
		}

		return this.setLoc(loc);
	}
});

const mkMutableState = reducers => (class {
	constructor(fields) {
		Object.assign(this, fields || defaultFields(reducers));
	}

	setLoc(loc) {
		this.loc = loc;
		return this;
	}

	setEscaping(escaping) {
		this.escaping = escaping;
		return this;
	}

	setExpansion(expansion) {
		this.expansion = expansion;
		return this;
	}

	setPreviousReducer(previousReducer) {
		this.previousReducer = previousReducer;
		return this;
	}

	setCurrent(current) {
		this.current = current;
		return this;
	}

	appendEmptyExpansion() {
		this.expansion = (this.expansion || []);
		this.expansion.push({
			loc: {start: Object.assign({}, this.loc.current)}
		});
		return this;
	}

	appendChar(char) {
		this.current = this.current + char;
		return this;
	}

	removeLastChar() {
		this.current = this.current.slice(0, -1);
		return this;
	}

	saveCurrentLocAsStart() {
		this.loc.start = Object.assign({}, this.loc.current);
		return this;
	}

	resetCurrent() {
		this.current = '';
		return this;
	}

	replaceLastExpansion(fields) {
		const xp = last(this.expansion);
		Object.assign(xp, fields);
		return this;
	}

	deleteLastExpansionValue() {
		const xp = last(this.expansion);
		delete xp.value;
		return this;
	}

	advanceLoc(char) {
		const loc = JSON.parse(JSON.stringify(this.loc));
		loc.previous = Object.assign({}, this.loc.current);

		if (char === '\n') {
			loc.current.row++;
			loc.current.col = 1;
		} else {
			loc.current.col++;
		}

		loc.current.char++;

		if (char && char.match(/\s/) && this.current === '') {
			loc.start = Object.assign({}, loc.current);
		}

		return this.setLoc(loc);
	}
});


const tok = (options, r) => (function* tokenizer(src) {
	r = r || reducers;

	// const State = process.env.NODE_NEV === 'development' ? mkImmutableState(r) : mkMutableState(r);
	const State = mkMutableState(r);

	let state = new State();

	let reduction = r.start;
	const source = Array.from(src);

	while (typeof reduction === 'function') {
		const char = source[0];
		const r2 = reduction(state, source, r);
		const nextReduction = r2.nextReduction;
		const tokensToEmit = r2.tokensToEmit;
		const nextState = r2.nextState;
		if (tokensToEmit) {
			yield * tokensToEmit;
		}

		/* if (char === undefined && nextReduction === reduction) {
			throw new Error('Loop detected');
		} */

		if (nextState) {
			state = nextState.advanceLoc(char);
		} else {
			state = state.advanceLoc(char);
		}

		reduction = nextReduction;
	}
});

tok.reducers = reducers;

export default tok;
