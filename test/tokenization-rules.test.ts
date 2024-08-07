import { assertEquals } from '@std/assert';
import type { LexerPhase } from '~/types.ts';
import enums from '../src/modes/bash/enums/index.ts';
import rules from '../src/modes/bash/rules/mod.ts';
import tokens from '../src/utils/tokens.ts';
// const _utils = require('./_utils');

const token = tokens.token;

function check(rule: LexerPhase, actual: any, expected: any) {
  // _utils.logResults({actual: Array.from(rule({}, mode)(actual)), expected});
  assertEquals(
    JSON.stringify(
      Array.from(rule({}, { enums }, {})(actual)),
    ),
    JSON.stringify(expected),
  );
}

Deno.test('tokenization-rules', async (t) => {
  await t.step('operatorTokens - identify operator with their tokens', () => {
    check(rules.operatorTokens, [token({ type: 'OPERATOR', value: '<<', loc: 42 })], [token({ type: 'DLESS', value: '<<', loc: 42 })]);
  });

  await t.step('reservedWords - identify reserved words or WORD', () => {
    check(
      rules.reservedWords,
      [
        token({ type: 'TOKEN', value: 'while', loc: 42 }),
        token({ type: 'TOKEN', value: 'otherWord', loc: 42 }),
      ],
      [
        token({ type: 'While', value: 'while', loc: 42 }),
        token({ type: 'WORD', value: 'otherWord', loc: 42 }),
      ],
    );
  });

  await t.step('functionName - replace function name token as NAME', () => {
    const input = [
      token({ type: 'WORD', value: 'test', loc: 42, _: { maybeStartOfSimpleCommand: true } }),
      token({ type: 'OPEN_PAREN', value: '(', loc: 42 }),
      token({ type: 'CLOSE_PAREN', value: ')', loc: 42 }),
      token({ type: 'Lbrace', value: '{', loc: 42 }),
      token({ type: 'WORD', value: 'body', loc: 42 }),
      token({ type: 'WORD', value: 'foo', loc: 42 }),
      token({ type: 'WORD', value: '--lol', loc: 42 }),
      token({ type: ';', value: ';', loc: 42 }),
      token({ type: 'Rbrace', value: '}', loc: 42 }),
    ];
    // _utils.logResults(result);

    check(rules.functionName, input, [
      token({ type: 'NAME', value: 'test', loc: 42, _: { maybeStartOfSimpleCommand: true } }),
      token({ type: 'OPEN_PAREN', value: '(', loc: 42 }),
      token({ type: 'CLOSE_PAREN', value: ')', loc: 42 }),
      token({ type: 'Lbrace', value: '{', loc: 42 }),
      token({ type: 'WORD', value: 'body', loc: 42 }),
      token({ type: 'WORD', value: 'foo', loc: 42 }),
      token({ type: 'WORD', value: '--lol', loc: 42 }),
      token({ type: ';', value: ';', loc: 42 }),
      token({ type: 'Rbrace', value: '}', loc: 42 }),
    ]);
  });
});
