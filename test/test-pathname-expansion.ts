import bashParser from '../src/parse.ts';
import utils from './_utils.ts';

/* eslint-disable camelcase */

Deno.test('parameter substitution in commands', () => {
    const result = bashParser('echo', {
        resolvePath() {
            return 'ciao';
        },
    });
    utils.checkResults(result.commands[0].name, {
        type: 'Word',
        text: 'ciao',
    });
});

Deno.test('parameter substitution in assignment', () => {
    const result = bashParser('a=echo', {
        resolvePath() {
            return 'ciao';
        },
    });
    utils.checkResults(result.commands[0].prefix[0], {
        type: 'AssignmentWord',
        text: 'a=ciao',
    });
});
