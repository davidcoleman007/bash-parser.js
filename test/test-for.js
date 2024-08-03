

import test from 'ava';
import bashParser from '../src/index.js';
import utils from './_utils.js';

/* eslint-disable camelcase */
test('parse for', (t) => {
	const result = bashParser('for x in a b c; do echo $x; done');
	// utils.logResults(result)
	utils.checkResults(t,
		result, {
			type: 'Script',
			commands: [{
				type: 'For',
				name: {type: 'Name', text: 'x'},
				wordlist: [{type: 'Word', text: 'a'}, {type: 'Word', text: 'b'}, {type: 'Word', text: 'c'}],
				do: {
					type: 'CompoundList',
					commands: [{
						type: 'Command',
						name: {type: 'Word', text: 'echo'},
						suffix: [{
							type: 'Word',
							text: '$x',
							expansion: [{
								type: 'ParameterExpansion',
								parameter: 'x',
								loc: {
									start: 0,
									end: 1
								}
							}]
						}]
					}]
				}
			}]
		}
	);
});

test('parse for with default sequence', (t) => {
	const result = bashParser('for x\n do echo $x\n done');
	// utils.logResults(result)
	utils.checkResults(t,
		result, {
			type: 'Script',
			commands: [{
				type: 'For',
				name: {type: 'Name', text: 'x'},
				do: {
					type: 'CompoundList',
					commands: [{
						type: 'Command',
						name: {type: 'Word', text: 'echo'},
						suffix: [{
							type: 'Word',
							text: '$x',
							expansion: [{
								type: 'ParameterExpansion',
								parameter: 'x',
								loc: {
									start: 0,
									end: 1
								}
							}]
						}]
					}]
				}
			}]
		}
	);
});

test('parse for with default sequence - on one line', (t) => {
	const result = bashParser('for x in; do echo $x; done');
	// utils.logResults(result)
	utils.checkResults(t,
		result, {
			type: 'Script',
			commands: [{
				type: 'For',
				name: {type: 'Name', text: 'x'},
				do: {
					type: 'CompoundList',
					commands: [{
						type: 'Command',
						name: {type: 'Word', text: 'echo'},
						suffix: [{
							type: 'Word',
							text: '$x',
							expansion: [{
								type: 'ParameterExpansion',
								parameter: 'x',
								loc: {
									start: 0,
									end: 1
								}
							}]
						}]
					}]
				}
			}]
		}
	);
});
