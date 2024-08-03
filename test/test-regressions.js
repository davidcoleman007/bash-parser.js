

import test from 'ava';
import bashParser from '../src/index.js';
import utils from './_utils.js';

/* eslint-disable camelcase */
test('Redirect should be allowed immediately following argument', (t) => {
	const result = bashParser('echo foo>file.txt');

	utils.checkResults(t, result, {
		type: 'Script',
		commands: [{
			type: 'Command',
			name: {type: 'Word', text: 'echo'},
			suffix: [
				{type: 'Word', text: 'foo'},
				{
					type: 'Redirect',
					op: {type: 'great', text: '>'},
					file: {type: 'Word', text: 'file.txt'}
				}
			]
		}]
	});
});

test('Equal sign should be allowed in arguments', (t) => {
	const result = bashParser('echo foo=bar');
	utils.checkResults(t, result, {
		type: 'Script',
		commands: [{
			type: 'Command',
			name: {type: 'Word', text: 'echo'},
			suffix: [{type: 'Word', text: 'foo=bar'}]
		}]
	});
});
