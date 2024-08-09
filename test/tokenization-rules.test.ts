import { assertEquals } from '@std/assert';
import type { LexerContext, LexerPhase } from '~/lexer/types.ts';
import rules from '~/modes/bash/phases/mod.ts';
import { mkToken } from '~/tokenizer/mod.ts';
import enums from '../src/modes/bash/enums/mod.ts';
// const _utils = require('./_utils');

function check(rule: LexerPhase, actual: any, expected: any) {
  // _utils.logResults({actual: Array.from(rule({}, mode)(actual)), expected});
  assertEquals(
    JSON.stringify(
      Array.from(rule({ enums } as LexerContext)(actual)),
    ),
    JSON.stringify(expected),
  );
}

Deno.test('tokenization-rules', async (t) => {
  await t.step('operatorTokens - identify operator with their tokens', () => {
    check(rules.operatorTokens, [mkToken('OPERATOR', '<<')], [mkToken('DLESS', '<<')]);
  });

  await t.step('reservedWords - identify reserved words or WORD', () => {
    check(
      rules.reservedWords,
      [
        mkToken('TOKEN', 'while'),
        mkToken('TOKEN', 'otherWord'),
      ],
      [
        mkToken('While', 'while'),
        mkToken('WORD', 'otherWord'),
      ],
    );
  });

  await t.step('functionName - replace function name token as NAME', () => {
    const input = [
      mkToken('WORD', 'test', {
        ctx: { maybeStartOfSimpleCommand: true },
      }),
      mkToken('OPEN_PAREN', '('),
      mkToken('CLOSE_PAREN', ')'),
      mkToken('Lbrace', '{'),
      mkToken('WORD', 'body'),
      mkToken('WORD', 'foo'),
      mkToken('WORD', '--lol'),
      mkToken(';', ';'),
      mkToken('Rbrace', '}'),
    ];
    // _utils.logResults(result);

    check(rules.functionName, input, [
      mkToken('NAME', 'test', {
        ctx: { maybeStartOfSimpleCommand: true },
      }),
      mkToken('OPEN_PAREN', '('),
      mkToken('CLOSE_PAREN', ')'),
      mkToken('Lbrace', '{'),
      mkToken('WORD', 'body'),
      mkToken('WORD', 'foo'),
      mkToken('WORD', '--lol'),
      mkToken(';', ';'),
      mkToken('Rbrace', '}'),
    ]);
  });
});
