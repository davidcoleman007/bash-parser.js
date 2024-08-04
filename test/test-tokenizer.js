import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import bashParser from '../src/index.js';
import utils from './_utils.js';

/* eslint-disable camelcase */

Deno.test('expand on a single word', () => {
    const result = bashParser('ls $var > res.txt', {
        mode: 'word-expansion'
    });
    // utils.logResults(result);
    utils.checkResults({
        type: 'Script',
        commands: [{
            type: 'Command',
            name: {
                type: 'Word',
                text: 'ls $var > res.txt',
                expansion: [{
                    parameter: 'var',
                    loc: {
                        start: 3,
                        end: 6
                    },
                    type: 'ParameterExpansion'
                }]
            }
        }]
    }, result);
});

Deno.test('parse while', () => {
    const result = bashParser('while true; do sleep 1; done');

    utils.checkResults(
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

Deno.test('parse until', () => {
    const result = bashParser('until true; do sleep 1; done');
    // console.log(inspect(result, {depth:null}))
    utils.checkResults(
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