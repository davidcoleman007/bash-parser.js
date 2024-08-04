import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import bashParser from '../src/index.js';
import utils from './_utils.js';

/* eslint-disable camelcase */

Deno.test('positional list parameter', () => {
    const result = bashParser('echoword=$@');
    // console.log(JSON.stringify(result, null, 5))
    utils.checkResults(result, {
        type: 'Script',
        commands: [{
            type: 'Command',
            prefix: [{
                type: 'AssignmentWord',
                text: 'echoword=$@',
                expansion: [{
                    type: 'ParameterExpansion',
                    parameter: '@',
                    kind: 'positional-list',
                    loc: {
                        start: 9,
                        end: 10
                    }
                }]
            }]
        }]
    });
});

Deno.test('positional string parameter', () => {
    const result = bashParser('echoword=$*');
    utils.checkResults(result, {
        type: 'Script',
        commands: [{
            type: 'Command',
            prefix: [{
                type: 'AssignmentWord',
                text: 'echoword=$*',
                expansion: [{
                    type: 'ParameterExpansion',
                    parameter: '*',
                    kind: 'positional-string',
                    loc: {
                        start: 9,
                        end: 10
                    }
                }]
            }]
        }]
    });
});

Deno.test('positional count parameter', () => {
    const result = bashParser('echoword=$#');
    utils.checkResults(result, {
        type: 'Script',
        commands: [{
            type: 'Command',
            prefix: [{
                type: 'AssignmentWord',
                text: 'echoword=$#',
                expansion: [{
                    type: 'ParameterExpansion',
                    parameter: '#',
                    kind: 'positional-count',
                    loc: {
                        start: 9,
                        end: 10
                    }
                }]
            }]
        }]
    });
});

Deno.test('last exit status', () => {
    const result = bashParser('echoword=$?');
    utils.checkResults(result, {
        type: 'Script',
        commands: [{
            type: 'Command',
            prefix: [{
                type: 'AssignmentWord',
                text: 'echoword=$?',
                expansion: [{
                    type: 'ParameterExpansion',
                    parameter: '?',
                    kind: 'last-exit-status',
                    loc: {
                        start: 9,
                        end: 10
                    }
                }]
            }]
        }]
    });
});

Deno.test('current option flags', () => {
    const result = bashParser('echoword=$-');
    utils.checkResults(result, {
        type: 'Script',
        commands: [{
            type: 'Command',
            prefix: [{
                type: 'AssignmentWord',
                text: 'echoword=$-',
                expansion: [{
                    type: 'ParameterExpansion',
                    parameter: '-',
                    kind: 'current-option-flags',
                    loc: {
                        start: 9,
                        end: 10
                    }
                }]
            }]
        }]
    });
});

Deno.test('shell process id', () => {
    const result = bashParser('echoword=$$');
    utils.checkResults(result, {
        type: 'Script',
        commands: [{
            type: 'Command',
            prefix: [{
                type: 'AssignmentWord',
                text: 'echoword=$$',
                expansion: [{
                    type: 'ParameterExpansion',
                    parameter: '$',
                    kind: 'shell-process-id',
                    loc: {
                        start: 9,
                        end: 10
                    }
                }]
            }]
        }]
    });
});

Deno.test('last background pid', () => {
    const result = bashParser('echoword=$!');
    utils.checkResults(result, {
        type: 'Script',
        commands: [{
            type: 'Command',
            prefix: [{
                type: 'AssignmentWord',
                text: 'echoword=$!',
                expansion: [{
                    type: 'ParameterExpansion',
                    parameter: '!',
                    kind: 'last-background-pid',
                    loc: {
                        start: 9,
                        end: 10
                    }
                }]
            }]
        }]
    });
});

Deno.test('shell script name', () => {
    const result = bashParser('echoword=$0');
    // logResults(result);
    utils.checkResults(result, {
        type: 'Script',
        commands: [{
            type: 'Command',
            prefix: [{
                type: 'AssignmentWord',
                text: 'echoword=$0',
                expansion: [{
                    type: 'ParameterExpansion',
                    parameter: '0',
                    kind: 'shell-script-name',
                    loc: {
                        start: 9,
                        end: 10
                    }
                }]
            }]
        }]
    });
});