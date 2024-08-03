

import test from 'ava';
import bashParser from '../src/index.js';
import utils from './_utils.js';

/* eslint-disable camelcase */
test('resolve tilde to current user home', (t) => {
	const result = bashParser('echo ~/subdir', {
		resolveHomeUser() {
			return '/home/current';
		}
	});
	// utils.logResults(result);
	utils.checkResults(t, result, {
		type: 'Script',
		commands: [
			{
				type: 'Command',
				name: {type: 'Word', text: 'echo'},
				suffix: [{
					type: 'Word',
					text: '/home/current/subdir'
				}]
			}
		]
	});
});

test('resolve one tilde only in normal WORD tokens', (t) => {
	const result = bashParser('echo ~/subdir/~other/', {
		resolveHomeUser() {
			return '/home/current';
		}
	});

	utils.checkResults(t, result, {
		type: 'Script',
		commands: [
			{
				type: 'Command',
				name: {type: 'Word', text: 'echo'},
				suffix: [{
					type: 'Word',
					text: '/home/current/subdir/~other/'
				}]
			}
		]
	});
});

test('resolve multiple tilde in assignments', (t) => {
	const result = bashParser('a=~/subdir:~/othersubdir/ciao', {
		resolveHomeUser() {
			return '/home/current';
		}
	});
	// utils.logResults(result.commands[0].prefix[0]);
	utils.checkResults(t, result.commands[0].prefix[0], {
		type: 'AssignmentWord',
		text: 'a=/home/current/subdir:/home/current/othersubdir/ciao'
	});
});

test('resolve tilde to any user home', (t) => {
	const result = bashParser('echo ~username/subdir', {
		resolveHomeUser() {
			return '/home/username';
		}
	});

	utils.checkResults(t, result, {
		type: 'Script',
		commands: [
			{
				type: 'Command',
				name: {type: 'Word', text: 'echo'},
				suffix: [{
					type: 'Word',
					text: '/home/username/subdir'
				}]
			}
		]
	});
});
