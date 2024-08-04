import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import rules from '../src/modes/posix/rules/index.js';
import enums from '../src/modes/posix/enums/index.js';
import utils from '../src/utils/index.js';
// const _utils = require('./_utils');

const token = utils.tokens.token;

function check(rule, actual, expected) {
    // _utils.logResults({actual: Array.from(rule({}, mode)(actual)), expected});
    assertEquals(
        JSON.stringify(
            Array.from(rule({}, {enums})(actual))
        ),
        JSON.stringify(expected)
    );
}

Deno.test('operatorTokens - identify operator with their tokens', () => {
    check(rules.operatorTokens,
        [token({type: 'OPERATOR', value: '<<', loc: 42})],
        [token({type: 'DLESS', value: '<<', loc: 42})]
    );
});

Deno.test('reservedWords - identify reserved words or WORD', () => {
    check(
        rules.reservedWords, [
            token({type: 'TOKEN', value: 'while', loc: 42}),
            token({type: 'TOKEN', value: 'otherWord', loc: 42})
        ], [
            token({type: 'While', value: 'while', loc: 42}),
            token({type: 'WORD', value: 'otherWord', loc: 42})
        ]
    );
});

Deno.test('functionName - replace function name token as NAME', () => {
    const input = [
        token({type: 'WORD', value: 'test', loc: 42, _: {maybeStartOfSimpleCommand: true}}),
        token({type: 'OPEN_PAREN', value: '(', loc: 42}),
        token({type: 'CLOSE_PAREN', value: ')', loc: 42}),
        token({type: 'Lbrace', value: '{', loc: 42}),
        token({type: 'WORD', value: 'body', loc: 42}),
        token({type: 'WORD', value: 'foo', loc: 42}),
        token({type: 'WORD', value: '--lol', loc: 42}),
        token({type: ';', value: ';', loc: 42}),
        token({type: 'Rbrace', value: '}', loc: 42})
    ];
    // _utils.logResults(result);

    check(rules.functionName, input,
        [
            token({type: 'NAME', value: 'test', loc: 42, _: {maybeStartOfSimpleCommand: true}}),
            token({type: 'OPEN_PAREN', value: '(', loc: 42}),
            token({type: 'CLOSE_PAREN', value: ')', loc: 42}),
            token({type: 'Lbrace', value: '{', loc: 42}),
            token({type: 'WORD', value: 'body', loc: 42}),
            token({type: 'WORD', value: 'foo', loc: 42}),
            token({type: 'WORD', value: '--lol', loc: 42}),
            token({type: ';', value: ';', loc: 42}),
            token({type: 'Rbrace', value: '}', loc: 42})
        ]
    );
});