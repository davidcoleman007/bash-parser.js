

import test from 'ava';
import bashParser from '../src/index.js';
import utils from './_utils.js';

test('arithmetic substitution', (t) => {
	const result = bashParser('variable=$((42 + 43))');
	delete result.commands[0].prefix[0].expansion[0].arithmeticAST;
	// console.log(JSON.stringify(result.commands[0].prefix[0]))
	utils.checkResults(t, result.commands[0].prefix[0], {
		text: 'variable=$((42 + 43))',
		type: 'AssignmentWord',
		expansion: [{
			expression: '42 + 43',
			type: 'ArithmeticExpansion',
			loc: {
				start: 9,
				end: 20
			}
		}]
	});
});

test('arithmetic substitution skip single quoted words', (t) => {
	const result = bashParser('echo \'$((42 * 42))\'');
	// utils.logResults(result)
	utils.checkResults(t, result.commands[0].suffix, [{
		type: 'Word',
		text: '$((42 * 42))'
	}]);
});

test('arithmetic substitution skip escaped dollar', (t) => {
	const result = bashParser('echo "\\$(\\(42 * 42))"');
	// utils.logResults(result)
	utils.checkResults(t, result.commands[0].suffix, [{
		type: 'Word',
		text: '\\$(\\(42 * 42))'
	}]);
});

test('arithmetic & parameter substitution', (t) => {
	const result = bashParser('variable=$((42 + 43)) $ciao');

	delete result.commands[0].prefix[0].expansion[0].arithmeticAST;
	// utils.logResults(result.commands[0].name);
	utils.checkResults(t, result.commands[0].prefix[0], {
		text: 'variable=$((42 + 43))',
		type: 'AssignmentWord',
		expansion: [{
			expression: '42 + 43',
			type: 'ArithmeticExpansion',
			loc: {
				start: 9,
				end: 20
			}

		}]
	});

	utils.checkResults(t, result.commands[0].name, {
		text: '$ciao',
		type: 'Word',
		expansion: [{
			type: 'ParameterExpansion',
			parameter: 'ciao',
			loc: {
				start: 0,
				end: 4
			}
		}]
	});
});

test('arithmetic substitution in suffix', (t) => {
	const result = bashParser('echo $((42 + 43))');
	delete result.commands[0].suffix[0].expansion[0].arithmeticAST;
	utils.checkResults(t, result.commands[0].suffix[0], {
		type: 'Word',
		text: '$((42 + 43))',
		expansion: [{
			expression: '42 + 43',
			type: 'ArithmeticExpansion',
			loc: {
				start: 0,
				end: 11
			}
		}]
	});
});

test('arithmetic substitution node applied to invalid expressions throws', t => {
	const result = t.throws(() => bashParser('echo $((a b c d))'));
	const message = result.message.split('\n')[0];
	t.is(message, 'Cannot parse arithmetic expression "a b c d": Unexpected token, expected ; (1:2)');
});

test('arithmetic substitution node applied to non expressions throws', t => {
	const result = t.throws(() => bashParser('echo $((while(1);))'));
	const message = result.message.split('\n')[0];
	t.is(message, 'Cannot parse arithmetic expression "while(1);": Not an expression');
});

test('arithmetic ast is parsed', (t) => {
	const result = bashParser('variable=$((42 + 43))')
		.commands[0].prefix[0].expansion[0].arithmeticAST;
	// utils.logResults(result)
	utils.checkResults(t, result, {
		type: 'BinaryExpression',
		start: 0,
		end: 7,
		loc: {
			start: {
				line: 1,
				column: 0
			},
			end: {
				line: 1,
				column: 7
			}
		},
		left: {
			type: 'NumericLiteral',
			start: 0,
			end: 2,
			loc: {
				start: {
					line: 1,
					column: 0
				},
				end: {
					line: 1,
					column: 2
				}
			},
			extra: {
				rawValue: 42,
				raw: '42'
			},
			value: 42
		},
		operator: '+',
		right: {
			type: 'NumericLiteral',
			start: 5,
			end: 7,
			loc: {
				start: {
					line: 1,
					column: 5
				},
				end: {
					line: 1,
					column: 7
				}
			},
			extra: {
				rawValue: 43,
				raw: '43'
			},
			value: 43
		}
	});
});

test('resolve expression', (t) => {
	const result = bashParser('"foo $((42 * 42)) baz"', {
		runArithmeticExpression() {
			return '43';
		}
	});
	delete result.commands[0].name.expansion[0].arithmeticAST;

	// utils.logResults(result.commands[0]);
	utils.checkResults(t, result.commands[0], {
		type: 'Command',
		name: {
			text: 'foo 43 baz',
			originalText: '"foo $((42 * 42)) baz"',
			expansion: [{
				expression: '42 * 42',
				loc: {
					start: 5,
					end: 16
				},
				resolved: true,
				type: 'ArithmeticExpansion'
			}],
			type: 'Word'
		}
	});
});

test('field splitting', (t) => {
	const result = bashParser('say $((other)) plz', {
		runArithmeticExpression() {
			return 'foo\tbar baz';
		},

		resolveEnv() {
			return '\t ';
		}
	});
	delete result.commands[0].suffix[0].expansion[0].arithmeticAST;
	delete result.commands[0].suffix[1].expansion[0].arithmeticAST;
	delete result.commands[0].suffix[2].expansion[0].arithmeticAST;

	// utils.logResults(result)

	utils.checkResults(t, result.commands[0], {
		type: 'Command',
		name: {
			text: 'say',
			type: 'Word'
		},
		suffix: [{
			text: 'foo',
			expansion: [{
				expression: 'other',
				loc: {
					start: 0,
					end: 9
				},
				type: 'ArithmeticExpansion',
				resolved: true
			}],
			originalText: '$((other))',
			type: 'Word',
			joined: 'foo\u0000bar\u0000baz',
			fieldIdx: 0
		}, {
			text: 'bar',
			expansion: [{
				expression: 'other',
				loc: {
					start: 0,
					end: 9
				},
				type: 'ArithmeticExpansion',
				resolved: true
			}],
			originalText: '$((other))',
			type: 'Word',
			joined: 'foo\u0000bar\u0000baz',
			fieldIdx: 1
		}, {
			text: 'baz',
			expansion: [{
				expression: 'other',
				loc: {
					start: 0,
					end: 9
				},
				type: 'ArithmeticExpansion',
				resolved: true
			}],
			originalText: '$((other))',
			type: 'Word',
			joined: 'foo\u0000bar\u0000baz',
			fieldIdx: 2
		}, {
			text: 'plz',
			type: 'Word'
		}]
	});
});

