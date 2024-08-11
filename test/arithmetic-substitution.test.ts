import { assertEquals, assertRejects } from '@std/assert';
import bashParser from '~/parse.ts';
import utils from './_utils.ts';

Deno.test('arithmetic substitution', async (t) => {
  await t.step('arithmetic substitution', async () => {
    const result = await bashParser('variable=$((42 + 43))');
    delete (result as any).commands[0].prefix[0].expansion[0].arithmeticAST;
    // console.log(JSON.stringify(result.commands[0].prefix[0]))
    utils.checkResults((result as any).commands[0].prefix[0], {
      text: 'variable=$((42 + 43))',
      type: 'AssignmentWord',
      expansion: [{
        expression: '42 + 43',
        type: 'ArithmeticExpansion',
        loc: {
          start: 9,
          end: 20,
        },
      }],
    });
  });

  await t.step('arithmetic substitution skip single quoted words', async () => {
    const result = await bashParser("echo '$((42 * 42))'");
    // utils.logResults(result)
    utils.checkResults((result as any).commands[0].suffix, [{
      type: 'Word',
      text: '$((42 * 42))',
    }]);
  });

  await t.step('arithmetic substitution skip escaped dollar', async () => {
    const result = await bashParser('echo "\\$(\\(42 * 42))"');
    // utils.logResults(result)
    utils.checkResults((result as any).commands[0].suffix, [{
      type: 'Word',
      text: '\\$(\\(42 * 42))',
    }]);
  });

  await t.step('arithmetic & parameter substitution', async () => {
    const result = await bashParser('variable=$((42 + 43)) $ciao');

    delete (result as any).commands[0].prefix[0].expansion[0].arithmeticAST;
    // utils.logResults(result.commands[0].name);
    utils.checkResults((result as any).commands[0].prefix[0], {
      text: 'variable=$((42 + 43))',
      type: 'AssignmentWord',
      expansion: [{
        expression: '42 + 43',
        type: 'ArithmeticExpansion',
        loc: {
          start: 9,
          end: 20,
        },
      }],
    });

    utils.checkResults((result as any).commands[0].name, {
      text: '$ciao',
      type: 'Word',
      expansion: [{
        type: 'ParameterExpansion',
        parameter: 'ciao',
        loc: {
          start: 0,
          end: 4,
        },
      }],
    });
  });

  await t.step('arithmetic substitution in suffix', async () => {
    const result = await bashParser('echo $((42 + 43))');
    delete (result as any).commands[0].suffix[0].expansion[0].arithmeticAST;
    utils.checkResults((result as any).commands[0].suffix[0], {
      type: 'Word',
      text: '$((42 + 43))',
      expansion: [{
        expression: '42 + 43',
        type: 'ArithmeticExpansion',
        loc: {
          start: 0,
          end: 11,
        },
      }],
    });
  });

  await t.step('arithmetic substitution node applied to invalid expressions throws', async () => {
    const result = (await assertRejects(() => bashParser('echo $((a b c d))'))) as Error;
    const message = result.message.split('\n')[0];
    assertEquals(message, 'Cannot parse arithmetic expression "a b c d": Missing semicolon. (1:1)');
  });

  await t.step('arithmetic substitution node applied to non expressions throws', async () => {
    const result = (await assertRejects(() => bashParser('echo $((while(1);))'))) as Error;
    const message = result.message.split('\n')[0];
    assertEquals(message, 'Cannot parse arithmetic expression "while(1);": Not an expression');
  });

  await t.step('arithmetic ast is parsed', async () => {
    const result = await bashParser('variable=$((42 + 43))');

    // utils.logResults(result)
    utils.checkResults((result as any).commands[0].prefix[0].expansion[0].arithmeticAST, {
      type: 'BinaryExpression',
      start: 0,
      end: 7,
      loc: {
        start: {
          line: 1,
          column: 0,
          index: 0,
        },
        end: {
          line: 1,
          column: 7,
          index: 7,
        },
      },
      left: {
        type: 'NumericLiteral',
        start: 0,
        end: 2,
        loc: {
          start: {
            line: 1,
            column: 0,
            index: 0,
          },
          end: {
            line: 1,
            column: 2,
            index: 2,
          },
        },
        extra: {
          rawValue: 42,
          raw: '42',
        },
        value: 42,
      },
      operator: '+',
      right: {
        type: 'NumericLiteral',
        start: 5,
        end: 7,
        loc: {
          start: {
            line: 1,
            column: 5,
            index: 5,
          },
          end: {
            line: 1,
            column: 7,
            index: 7,
          },
        },
        extra: {
          rawValue: 43,
          raw: '43',
        },
        value: 43,
      },
    });
  });

  await t.step('resolve expression', async () => {
    const result = await bashParser('"foo $((42 * 42)) baz"', {
      async runArithmeticExpression() {
        return '43';
      },
    });
    delete (result as any).commands[0].name.expansion[0].arithmeticAST;

    // utils.logResults(result.commands[0]);
    utils.checkResults(result.commands[0], {
      type: 'Command',
      name: {
        text: 'foo 43 baz',
        originalText: '"foo $((42 * 42)) baz"',
        expansion: [{
          expression: '42 * 42',
          loc: {
            start: 5,
            end: 16,
          },
          resolved: true,
          type: 'ArithmeticExpansion',
        }],
        type: 'Word',
      },
    });
  });

  await t.step('field splitting', async () => {
    const result = await bashParser('say $((other)) plz', {
      async runArithmeticExpression() {
        return 'foo\tbar baz';
      },

      async resolveEnv() {
        return '\t ';
      },
    });
    delete (result as any).commands[0].suffix[0].expansion[0].arithmeticAST;
    delete (result as any).commands[0].suffix[1].expansion[0].arithmeticAST;
    delete (result as any).commands[0].suffix[2].expansion[0].arithmeticAST;

    // utils.logResults(result)

    utils.checkResults(result.commands[0], {
      type: 'Command',
      name: {
        text: 'say',
        type: 'Word',
      },
      suffix: [{
        text: 'foo',
        expansion: [{
          expression: 'other',
          loc: {
            start: 0,
            end: 9,
          },
          type: 'ArithmeticExpansion',
          resolved: true,
        }],
        originalText: '$((other))',
        type: 'Word',
        joined: 'foo\u0000bar\u0000baz',
        fieldIdx: 0,
      }, {
        text: 'bar',
        expansion: [{
          expression: 'other',
          loc: {
            start: 0,
            end: 9,
          },
          type: 'ArithmeticExpansion',
          resolved: true,
        }],
        originalText: '$((other))',
        type: 'Word',
        joined: 'foo\u0000bar\u0000baz',
        fieldIdx: 1,
      }, {
        text: 'baz',
        expansion: [{
          expression: 'other',
          loc: {
            start: 0,
            end: 9,
          },
          type: 'ArithmeticExpansion',
          resolved: true,
        }],
        originalText: '$((other))',
        type: 'Word',
        joined: 'foo\u0000bar\u0000baz',
        fieldIdx: 2,
      }, {
        text: 'plz',
        type: 'Word',
      }],
    });
  });
});
