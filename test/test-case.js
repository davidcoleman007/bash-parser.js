

/* eslint-disable camelcase */

import test from 'ava';

import bashParser from '../src/index.js';
import utils from './_utils.js';

test('parse case', (t) => {
	const result = bashParser('case foo in * ) echo bar;; esac');
	// utils.logResults(result);
	const expected = {
		type: 'Script',
		commands: [{
			type: 'Case',
			clause: {
				type: 'Word',
				text: 'foo'
			},
			cases: [{
				type: 'CaseItem',
				pattern: [{
					type: 'Word',
					text: '*'
				}],
				body: {
					type: 'CompoundList',
					commands: [{
						type: 'Command',
						name: {type: 'Word', text: 'echo'},
						suffix: [{type: 'Word', text: 'bar'}]
					}]
				}
			}]
		}]
	};
	utils.checkResults(t, result, expected);
});
/*
test.skip('parse case with compound list', (t) => {
	const result = bashParser('case foo in * ) echo foo;echo bar;; esac');
	// utils.logResults(result);
	const expected = {
		type: 'Script',
		commands: [{
			type: 'LogicalExpression',
			left: {
				type: 'Pipeline',
				commands: [{
					type: 'Case',
					clause: {
						text: 'foo'
					},
					cases: [{
						type: 'CaseItem',
						pattern: [{
							text: '*'
						}],
						body: {
							type: 'CompoundList',
							commands: [{
								type: 'LogicalExpression',
								left: {
									type: 'Pipeline',
									commands: [{
										type: 'Command',
										name: {text: 'echo'},
										suffix: [{text: 'bar'}]
									}]
								}
							}]
						}
					}]
				}]
			}
		}]
	};

	t.is(JSON.stringify(result), JSON.stringify(expected));
});
*/
