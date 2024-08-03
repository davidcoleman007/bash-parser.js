

import test from 'ava';
import bashParser from '../src/index.js';
import utils from './_utils.js';

/* eslint-disable camelcase */

test('parse function declaration multiple lines', (t) => {
	const result = bashParser('foo () \n{\n command bar --lol;\n}');
	// utils.logResults(result);
	utils.checkResults(t,
		result, {
			type: 'Script',
			commands: [{
				type: 'Function',
				name: {type: 'Name', text: 'foo'},
				body: {
					type: 'CompoundList',
					commands: [{
						type: 'Command',
						name: {type: 'Word', text: 'command'},
						suffix: [{type: 'Word', text: 'bar'}, {type: 'Word', text: '--lol'}]
					}]
				}
			}]
		}
	);
});

test('parse function declaration with redirections', (t) => {
	const src = `foo () {
	 command bar --lol;
	} > file.txt`;

	const result = bashParser(src);
	// utils.logResults(result);
	utils.checkResults(t,
		result, {
			type: 'Script',
			commands: [{
				type: 'Function',
				name: {type: 'Name', text: 'foo'},
				redirections: [{
					type: 'Redirect',
					op: {type: 'great', text: '>'},
					file: {type: 'Word', text: 'file.txt'}
				}],
				body: {
					type: 'CompoundList',
					commands: [{
						type: 'Command',
						name: {type: 'Word', text: 'command'},
						suffix: [{type: 'Word', text: 'bar'}, {type: 'Word', text: '--lol'}]
					}]
				}
			}]
		}
	);
});

test('parse function declaration', (t) => {
	const result = bashParser('foo	(){ command bar --lol;  }');

	utils.checkResults(t,
		result, {
			type: 'Script',
			commands: [{
				type: 'Function',
				name: {type: 'Name', text: 'foo'},
				body: {
					type: 'CompoundList',
					commands: [{
						type: 'Command',
						name: {type: 'Word', text: 'command'},
						suffix: [{type: 'Word', text: 'bar'}, {type: 'Word', text: '--lol'}]
					}]
				}
			}]
		}
	);
});
