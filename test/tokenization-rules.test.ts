import { assertEquals } from '@std/assert';
import type { LexerPhase } from '~/lexer/types.ts';
import enums from '~/modes/bash/enums/index.ts';
import rules from '~/modes/bash/phases/mod.ts';
import { token } from '~/tokenizer/mod.ts';
import type { Mode } from '~/types.ts';
// const _utils = require('./_utils');

function check(rule: LexerPhase, actual: any, expected: any) {
  // _utils.logResults({actual: Array.from(rule({}, mode)(actual)), expected});
  assertEquals(
    JSON.stringify(
      Array.from(rule({}, { enums } as Mode, [])(actual)),
    ),
    JSON.stringify(expected),
  );
}

Deno.test('tokenization-rules', async (t) => {
  await t.step('operatorTokens - identify operator with their tokens', () => {
    check(rules.operatorTokens, [token({ type: 'OPERATOR', value: '<<' })], [token({ type: 'DLESS', value: '<<' })]);
  });

  await t.step('reservedWords - identify reserved words or WORD', () => {
    check(
      rules.reservedWords,
      [
        token({ type: 'TOKEN', value: 'while' }),
        token({ type: 'TOKEN', value: 'otherWord' }),
      ],
      [
        token({ type: 'While', value: 'while' }),
        token({ type: 'WORD', value: 'otherWord' }),
      ],
    );
  });

  await t.step('functionName - replace function name token as NAME', () => {
    const input = [
      token({ type: 'WORD', value: 'test', _: { maybeStartOfSimpleCommand: true } }),
      token({ type: 'OPEN_PAREN', value: '(' }),
      token({ type: 'CLOSE_PAREN', value: ')' }),
      token({ type: 'Lbrace', value: '{' }),
      token({ type: 'WORD', value: 'body' }),
      token({ type: 'WORD', value: 'foo' }),
      token({ type: 'WORD', value: '--lol' }),
      token({ type: ';', value: ';' }),
      token({ type: 'Rbrace', value: '}' }),
    ];
    // _utils.logResults(result);

    check(rules.functionName, input, [
      token({ type: 'NAME', value: 'test', _: { maybeStartOfSimpleCommand: true } }),
      token({ type: 'OPEN_PAREN', value: '(' }),
      token({ type: 'CLOSE_PAREN', value: ')' }),
      token({ type: 'Lbrace', value: '{' }),
      token({ type: 'WORD', value: 'body' }),
      token({ type: 'WORD', value: 'foo' }),
      token({ type: 'WORD', value: '--lol' }),
      token({ type: ';', value: ';' }),
      token({ type: 'Rbrace', value: '}' }),
    ]);
  });
});
