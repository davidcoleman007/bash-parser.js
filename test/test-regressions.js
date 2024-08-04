import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import bashParser from '../src/index.js';
import utils from './_utils.js';

/* eslint-disable camelcase */

Deno.test('Redirect should be allowed immediately following argument', () => {
    const result = bashParser('echo foo>file.txt');

    utils.checkResults(result, {
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

Deno.test('Equal sign should be allowed in arguments', () => {
    const result = bashParser('echo foo=bar');
    utils.checkResults(result, {
        type: 'Script',
        commands: [{
            type: 'Command',
            name: {type: 'Word', text: 'echo'},
            suffix: [{type: 'Word', text: 'foo=bar'}]
        }]
    });
});