import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import bashParser from '../src/index.js';
import utils from './_utils.js';
// const mkloc = require('./_utils').mkloc2;

Deno.test('empty line after line continuation', () => {
    const cmd = `echo \\\n\n\necho there`;
    const result = bashParser(cmd);
    // utils.logResults(result);
    const expected = {
        type: 'Script',
        commands: [
            {
                type: 'Command',
                name: {
                    text: 'echo',
                    type: 'Word'
                }
            },
            {
                type: 'Command',
                name: {
                    text: 'echo',
                    type: 'Word'
                },
                suffix: [
                    {
                        text: 'there',
                        type: 'Word'
                    }
                ]
            }
        ]
    };
    utils.checkResults(result, expected);
});

Deno.test('loc take into account line continuations', () => {
    const cmd = 'echo \\\nworld';
    const result = bashParser(cmd, { insertLOC: true });
    // utils.logResults(result);
    const expected = {
        type: 'Script',
        commands: [
            {
                type: 'Command',
                name: {
                    text: 'echo',
                    type: 'Word',
                    loc: {
                        start: {
                            col: 1,
                            row: 1,
                            char: 0
                        },
                        end: {
                            col: 4,
                            row: 1,
                            char: 3
                        }
                    }
                },
                loc: {
                    start: {
                        col: 1,
                        row: 1,
                        char: 0
                    },
                    end: {
                        col: 5,
                        row: 2,
                        char: 11
                    }
                },
                suffix: [
                    {
                        text: 'world',
                        type: 'Word',
                        loc: {
                            start: {
                                col: 1,
                                row: 2,
                                char: 7
                            },
                            end: {
                                col: 5,
                                row: 2,
                                char: 11
                            }
                        }
                    }
                ]
            }
        ],
        loc: {
            start: {
                col: 1,
                row: 1,
                char: 0
            },
            end: {
                col: 5,
                row: 2,
                char: 11
            }
        }
    };

    // utils.logResults(result);

    utils.checkResults(result, expected);
});