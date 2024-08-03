

import test from 'ava';
import bashParser from '../src/index.js';
import utils from './_utils.js';

/* eslint-disable camelcase */
test('parse while', (t) => {
	const result = bashParser('while true; do sleep 1; done');

	utils.checkResults(t,
		result, {
			type: 'Script',
			commands: [{
				type: 'While',
				clause: {
					type: 'CompoundList',
					commands: [{
						type: 'Command',
						name: {type: 'Word', text: 'true'}
					}]
				},
				do: {
					type: 'CompoundList',
					commands: [{
						type: 'Command',
						name: {type: 'Word', text: 'sleep'},
						suffix: [{type: 'Word', text: '1'}]
					}]
				}
			}]
		}
	);
});

test('parse until', (t) => {
	const result = bashParser('until true; do sleep 1; done');
 //	console.log(inspect(result, {depth:null}))
	utils.checkResults(t,
		result, {
			type: 'Script',
			commands: [{
				type: 'Until',
				clause: {
					type: 'CompoundList',
					commands: [{
						type: 'Command',
						name: {type: 'Word', text: 'true'}
					}]
				},
				do: {
					type: 'CompoundList',
					commands: [{
						type: 'Command',
						name: {type: 'Word', text: 'sleep'},
						suffix: [{type: 'Word', text: '1'}]
					}]
				}
			}]
		}
	);
});
