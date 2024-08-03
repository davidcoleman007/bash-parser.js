

import test from 'ava';
import bashParser from '../src/index.js';
import utils from './_utils.js';

function testUnclosed(cmd, char) {
	return t => {
		const err = t.throws(() => bashParser(cmd));
		t.truthy(err instanceof SyntaxError);
		t.is(err.message, 'Unclosed ' + char);
	};
}

test('throws on unclosed double quotes', testUnclosed('echo "TEST1', '"'));
test('throws on unclosed single quotes', testUnclosed('echo \'TEST1', '\''));
test('throws on unclosed command subst', testUnclosed('echo $(TEST1', '$('));
test('throws on unclosed backtick command subst', testUnclosed('echo `TEST1', '`'));
test('throws on unclosed arhit subst', testUnclosed('echo $((TEST1', '$(('));
test('throws on unclosed param subst', testUnclosed('echo ${TEST1', '${'));

test('quotes within double quotes', (t) => {
	const result = bashParser('echo "TEST1 \'TEST2"');
	// utils.logResults(result)
	utils.checkResults(t, result, {
		type: 'Script',
		commands: [{
			type: 'Command',
			name: {type: 'Word', text: 'echo'},
			suffix: [{type: 'Word', text: 'TEST1 \'TEST2'}]
		}]
	});
});

test('escaped double quotes within double quotes', (t) => {
	const result = bashParser('echo "TEST1 \\"TEST2"');
	// utils.logResults(result);
	utils.checkResults(t, result, {
		type: 'Script',
		commands: [{
			type: 'Command',
			name: {type: 'Word', text: 'echo'},
			suffix: [{type: 'Word', text: 'TEST1 "TEST2'}]
		}]
	});
});

test('double quotes within single quotes', (t) => {
	const result = bashParser('echo \'TEST1 "TEST2\'');
	utils.checkResults(t, result, {
		type: 'Script',
		commands: [{
			type: 'Command',
			name: {type: 'Word', text: 'echo'},
			suffix: [{type: 'Word', text: 'TEST1 "TEST2'}]
		}]
	});
});

test('Partially quoted word', (t) => {
	const result = bashParser('echo TEST1\' TEST2 \'TEST3');
	utils.checkResults(t, result, {
		type: 'Script',
		commands: [{
			type: 'Command',
			name: {type: 'Word', text: 'echo'},
			suffix: [{type: 'Word', text: 'TEST1 TEST2 TEST3'}]
		}]
	});
});

test('Partially double quoted word', (t) => {
	const result = bashParser('echo TEST3" TEST4 "TEST5');
	// utils.logResults(result);
	utils.checkResults(t, result, {
		type: 'Script',
		commands: [{
			type: 'Command',
			name: {type: 'Word', text: 'echo'},
			suffix: [{type: 'Word', text: 'TEST3 TEST4 TEST5'}]
		}]
	});
});
