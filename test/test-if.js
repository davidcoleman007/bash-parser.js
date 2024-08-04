import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import bashParser from '../src/index.js';
import utils from './_utils.js';

Deno.test('parse if', () => {
    const result = bashParser('if true; then echo 1; fi');
    // console.log(inspect(result, {depth:null}))
    utils.checkResults(
        result, {
            type: 'Script',
            commands: [{
                type: 'If',
                clause: {
                    type: 'CompoundList',
                    commands: [{
                        type: 'Command',
                        name: {type: 'Word', text: 'true'}
                    }]
                },
                then: {
                    type: 'CompoundList',
                    commands: [{
                        type: 'Command',
                        name: {type: 'Word', text: 'echo'},
                        suffix: [{type: 'Word', text: '1'}]
                    }]
                }
            }]
        }
    );
});

Deno.test('parse if else', () => {
    const result = bashParser('if true; then echo 1; else echo 2; fi');
    // utils.logResults(result);
    utils.checkResults(
        result, {
            type: 'Script',
            commands: [{
                type: 'If',
                clause: {
                    type: 'CompoundList',
                    commands: [{
                        type: 'Command',
                        name: {type: 'Word', text: 'true'}
                    }]
                },
                then: {
                    type: 'CompoundList',
                    commands: [{
                        type: 'Command',
                        name: {type: 'Word', text: 'echo'},
                        suffix: [{type: 'Word', text: '1'}]
                    }]
                },
                else: {
                    type: 'CompoundList',
                    commands: [{
                        type: 'Command',
                        name: {type: 'Word', text: 'echo'},
                        suffix: [{type: 'Word', text: '2'}]
                    }]
                }
            }]
        }
    );
});

Deno.test('parse if else multiline', () => {
    const result = bashParser('if true; then \n echo 1;\n else\n echo 2;\n fi');
    // console.log(inspect(result, {depth:null}))
    utils.checkResults(
        result, {
            type: 'Script',
            commands: [{
                type: 'If',
                clause: {
                    type: 'CompoundList',
                    commands: [{
                        type: 'Command',
                        name: {type: 'Word', text: 'true'}
                    }]
                },
                then: {
                    type: 'CompoundList',
                    commands: [{
                        type: 'Command',
                        name: {type: 'Word', text: 'echo'},
                        suffix: [{type: 'Word', text: '1'}]
                    }]
                },
                else: {
                    type: 'CompoundList',
                    commands: [{
                        type: 'Command',
                        name: {type: 'Word', text: 'echo'},
                        suffix: [{type: 'Word', text: '2'}]
                    }]
                }
            }]
        }
    );
});

Deno.test('parse if elif else', () => {
    const result = bashParser('if true; then echo 1; elif false; then echo 3; else echo 2; fi');
    // utils.logResults(result);
    const expected = {
        type: 'Script',
        commands: [{
            type: 'If',
            clause: {
                type: 'CompoundList',
                commands: [{
                    type: 'Command',
                    name: {type: 'Word', text: 'true'}
                }]
            },
            then: {
                type: 'CompoundList',
                commands: [{
                    type: 'Command',
                    name: {type: 'Word', text: 'echo'},
                    suffix: [{type: 'Word', text: '1'}]
                }]
            },
            else: {
                type: 'If',
                clause: {
                    type: 'CompoundList',
                    commands: [{
                        type: 'Command',
                        name: {type: 'Word', text: 'false'}
                    }]
                },
                then: {
                    type: 'CompoundList',
                    commands: [{
                        type: 'Command',
                        name: {type: 'Word', text: 'echo'},
                        suffix: [{type: 'Word', text: '3'}]
                    }]
                },
                else: {
                    type: 'CompoundList',
                    commands: [{
                        type: 'Command',
                        name: {type: 'Word', text: 'echo'},
                        suffix: [{type: 'Word', text: '2'}]
                    }]
                }
            }
        }]
    };

    // utils.logDiff(result, expected)
    utils.checkResults(result, expected);
});