

import test from 'ava';
import bashParser from '../src/index.js';
import utils from './_utils.js';

test('remove double quote from string', (t) => {
	const result = bashParser('"echo"');
	utils.checkResults(t, result.commands[0].name, {
		type: 'Word',
		text: 'echo'
	});
});

test('remove single quotes from string', (t) => {
	const result = bashParser('\'echo\'');
	utils.checkResults(t, result.commands[0].name, {
		type: 'Word',
		text: 'echo'
	});
});

test('remove unnecessary slashes from string', (t) => {
	const result = bashParser('ec\\%ho');
	utils.checkResults(t, result.commands[0].name, {
		type: 'Word',
		text: 'ec%ho'
	});
});

test('not remove quotes from middle of string if escaped', (t) => {
	const result = bashParser('ec\\\'\\"ho');

	utils.checkResults(t, result.commands[0].name, {
		type: 'Word',
		text: 'ec\'"ho'
	});
});

test('transform escaped characters', (t) => {
	const result = bashParser('"ec\\t\\nho"');

	utils.checkResults(t, result.commands[0].name, {
		type: 'Word',
		text: 'ec\t\nho'
	});
});

test('not remove special characters', (t) => {
	const result = bashParser('"ec\tho"');

	utils.checkResults(t, result.commands[0].name, {
		type: 'Word',
		text: 'ec\tho'
	});
});

test('remove quotes from middle of string', (t) => {
	const result = bashParser('ec\'h\'o');
	// utils.logResults(result)
	utils.checkResults(t, result.commands[0].name, {
		type: 'Word',
		text: 'echo'
	});
});

test('remove quotes on assignment', (t) => {
	const result = bashParser('echo="ciao mondo"');

	utils.checkResults(t, result.commands[0].prefix[0], {
		text: 'echo=ciao mondo',
		type: 'AssignmentWord'
	});
});

test('remove quotes followed by single quotes', (t) => {
	const result = bashParser('echo"ciao"\'mondo\'');

	utils.checkResults(t, result.commands[0].name, {
		text: 'echociaomondo',
		type: 'Word'
	});
});

test('remove single quotes followed by quotes', (t) => {
	const result = bashParser('echo\'ciao\'"mondo"');

	utils.checkResults(t, result.commands[0].name, {
		text: 'echociaomondo',
		type: 'Word'
	});
});
