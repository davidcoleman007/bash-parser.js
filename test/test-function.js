import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import bashParser from '../src/index.js';
import utils from './_utils.js';

/* eslint-disable camelcase */

Deno.test('parse function declaration multiple lines', () => {
    const result = bashParser('foo () \n{\n command bar --lol;\n}');
    // utils.logResults(result);
    utils.checkResults(
        result, {
            type: 'Script',
            commands: [{
                type: 'Function',
                name: {type: 'Name', text: 'foo'},
                body: {
                    type: 'CompoundList',
                    commands: [{
                        type: 'Command',
                        name: {type: 'Word', text: 'command'},
                        suffix: [{type: 'Word', text: 'bar'}, {type: 'Word', text: '--lol'}]
                    }]
                }
            }]
        }
    );
});

Deno.test('parse function declaration with redirections', () => {
    const src = `foo () {
     command bar --lol;
    } > file.txt`;

    const result = bashParser(src);
    // utils.logResults(result);
    utils.checkResults(
        result, {
            type: 'Script',
            commands: [{
                type: 'Function',
                name: {type: 'Name', text: 'foo'},
                redirections: [{
                    type: 'Redirect',
                    op: {type: 'great', text: '>'},
                    file: {type: 'Word', text: 'file.txt'}
                }],
                body: {
                    type: 'CompoundList',
                    commands: [{
                        type: 'Command',
                        name: {type: 'Word', text: 'command'},
                        suffix: [{type: 'Word', text: 'bar'}, {type: 'Word', text: '--lol'}]
                    }]
                }
            }]
        }
    );
});

Deno.test('parse function declaration', () => {
    const result = bashParser('foo	(){ command bar --lol;  }');

    utils.checkResults(
        result, {
            type: 'Script',
            commands: [{
                type: 'Function',
                name: {type: 'Name', text: 'foo'},
                body: {
                    type: 'CompoundList',
                    commands: [{
                        type: 'Command',
                        name: {type: 'Word', text: 'command'},
                        suffix: [{type: 'Word', text: 'bar'}, {type: 'Word', text: '--lol'}]
                    }]
                }
            }]
        }
    );
});