/* eslint-disable camelcase */

import bashParser from '../src/parse.ts';
import utils from './_utils.ts';

Deno.test('expand on a single word', () => {
    const result = bashParser('ls $var > res.txt', {
        mode: 'word-expansion',
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
                        end: 6,
                    },
                    type: 'ParameterExpansion',
                }],
            },
        }],
    }, result);
});
