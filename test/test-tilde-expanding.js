import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import bashParser from '../src/index.js';
import utils from './_utils.js';

/* eslint-disable camelcase */

Deno.test('resolve tilde to current user home', () => {
    const result = bashParser('echo ~/subdir', {
        resolveHomeUser() {
            return '/home/current';
        }
    });
    // utils.logResults(result);
    utils.checkResults(result, {
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

Deno.test('resolve one tilde only in normal WORD tokens', () => {
    const result = bashParser('echo ~/subdir/~other/', {
        resolveHomeUser() {
            return '/home/current';
        }
    });

    utils.checkResults(result, {
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

Deno.test('resolve multiple tilde in assignments', () => {
    const result = bashParser('a=~/subdir:~/othersubdir/ciao', {
        resolveHomeUser() {
            return '/home/current';
        }
    });
    // utils.logResults(result.commands[0].prefix[0]);
    utils.checkResults(result.commands[0].prefix[0], {
        type: 'AssignmentWord',
        text: 'a=/home/current/subdir:/home/current/othersubdir/ciao'
    });
});

Deno.test('resolve tilde to any user home', () => {
    const result = bashParser('echo ~username/subdir', {
        resolveHomeUser() {
            return '/home/username';
        }
    });

    utils.checkResults(result, {
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