

import test from 'ava';
import bashParser from '../src/index.js';
import utils from './_utils.js';

/* eslint-disable camelcase */
test('parameter substitution in commands', (t) => {
	const result = bashParser('echo', {
		resolvePath() {
			return 'ciao';
		}
	});
	utils.checkResults(t, result.commands[0].name, {
		type: 'Word',
		text: 'ciao'
	});
});

test('parameter substitution in assignment', (t) => {
	const result = bashParser('a=echo', {
		resolvePath() {
			return 'ciao';
		}
	});
	utils.checkResults(t, result.commands[0].prefix[0], {
		type: 'AssignmentWord',
		text: 'a=ciao'
	});
});
