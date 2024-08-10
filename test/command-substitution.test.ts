import { assert, assertRejects } from '@std/assert';
import bashParser from '~/parse.ts';
import utils from './_utils.ts';

Deno.test('command substitution', async (t) => {
  await t.step('command substitution', async () => {
    const result = await bashParser('variable=$(echo ciao)');
    // utils.logResults(result)
    delete (result as any).commands[0].prefix[0].expansion[0].commandAST;
    utils.checkResults((result as any).commands[0].prefix, [{
      type: 'AssignmentWord',
      text: 'variable=$(echo ciao)',
      expansion: [{
        command: 'echo ciao',
        type: 'CommandExpansion',
        loc: {
          start: 9,
          end: 20,
        },
      }],
    }]);
  });

  await t.step('command substitution skip escaped dollar', async () => {
    const result = await bashParser('echo "\\$\\(echo ciao)"');
    // utils.logResults(result)
    utils.checkResults((result as any).commands[0].suffix, [{
      type: 'Word',
      text: '\\$\\(echo ciao)',
    }]);
  });

  await t.step('command substitution skip escaped backtick', async () => {
    const err = (await assertRejects(() => bashParser('echo "\\`echo ciao`"'))) as Error;
    assert(err.message, 'Unclosed `');
  });

  await t.step('command substitution skip single quoted words', async () => {
    const result = await bashParser("echo '$(echo ciao)'");
    // utils.logResults(result)
    utils.checkResults((result as any).commands[0].suffix, [{
      type: 'Word',
      text: '$(echo ciao)',
    }]);
  });

  await t.step('command substitution with backticks skip single quoted words', async () => {
    const result = await bashParser("echo '`echo ciao`'");
    // utils.logResults(result)
    utils.checkResults((result as any).commands[0].suffix, [{ type: 'Word', text: '`echo ciao`' }]);
  });

  await t.step('command substitution in suffix', async () => {
    const result = await bashParser('echo $(ciao)');
    delete (result as any).commands[0].suffix[0].expansion[0].commandAST;
    utils.checkResults((result as any).commands[0].suffix, [{
      type: 'Word',
      text: '$(ciao)',
      expansion: [{
        command: 'ciao',
        type: 'CommandExpansion',
        loc: {
          start: 0,
          end: 6,
        },
      }],
    }]);
  });

  await t.step('command substitution in suffix with backticks', async () => {
    const result = await bashParser('echo `ciao`');
    delete (result as any).commands[0].suffix[0].expansion[0].commandAST;

    utils.checkResults((result as any).commands[0].suffix, [{
      type: 'Word',
      text: '`ciao`',
      expansion: [{
        command: 'ciao',
        type: 'CommandExpansion',
        loc: {
          start: 0,
          end: 5,
        },
      }],
    }]);
  });

  await t.step('command ast is recursively parsed', async () => {
    const result = await bashParser('variable=$(echo ciao)');

    // utils.logResults(result);

    utils.checkResults((result as any).commands[0].prefix[0].expansion[0].commandAST, {
      type: 'Script',
      commands: [{
        type: 'Command',
        name: { type: 'Word', text: 'echo' },
        suffix: [{ type: 'Word', text: 'ciao' }],
      }],
    });
  });

  await t.step('command substitution with backticks', async () => {
    const result = await bashParser('variable=`echo ciao`');
    delete (result as any).commands[0].prefix[0].expansion[0].commandAST;

    utils.checkResults((result as any).commands[0].prefix, [{
      type: 'AssignmentWord',
      text: 'variable=`echo ciao`',
      expansion: [{
        command: 'echo ciao',
        type: 'CommandExpansion',
        loc: {
          start: 9,
          end: 19,
        },
      }],
    }]);
  });

  await t.step('quoted backtick are removed within command substitution with backticks', async () => {
    const result = await bashParser('variable=`echo \\`echo ciao\\``');
    delete (result as any).commands[0].prefix[0].expansion[0].commandAST;
    // utils.logResults(result);

    utils.checkResults((result as any).commands[0].prefix, [{
      type: 'AssignmentWord',
      text: 'variable=`echo \\`echo ciao\\``',
      expansion: [{
        command: 'echo `echo ciao`',
        type: 'CommandExpansion',
        loc: {
          start: 9,
          end: 28,
        },
      }],
    }]);
  });

  await t.step('quoted backtick are not removed within command substitution with parenthesis', async () => {
    const result = await bashParser('variable=$(echo \\`echo ciao\\`)');
    delete (result as any).commands[0].prefix[0].expansion[0].commandAST;
    utils.checkResults((result as any).commands[0].prefix, [{
      type: 'AssignmentWord',
      text: 'variable=$(echo \\`echo ciao\\`)',
      expansion: [{
        command: 'echo \\`echo ciao\\`',
        type: 'CommandExpansion',
        loc: {
          start: 9,
          end: 29,
        },
      }],
    }]);
  });

  await t.step('resolve double command', async () => {
    const result = await bashParser('"foo $(other) $(one) baz"', {
      execCommand() {
        return 'bar';
      },
    });
    // utils.logResults(result.commands[0]);
    delete (result as any).commands[0].name.expansion[0].commandAST;
    delete (result as any).commands[0].name.expansion[1].commandAST;

    // utils.logResults(result.commands[0]);
    utils.checkResults(result.commands[0], {
      type: 'Command',
      name: {
        text: 'foo bar bar baz',
        originalText: '"foo $(other) $(one) baz"',
        expansion: [{
          command: 'other',
          loc: { start: 5, end: 12 },
          resolved: true,
          type: 'CommandExpansion',
        }, {
          command: 'one',
          loc: { start: 14, end: 19 },
          resolved: true,
          type: 'CommandExpansion',
        }],
        type: 'Word',
      },
    });
  });

  await t.step('resolve double command with backticks', async () => {
    const result = await bashParser('"foo `other` `one` baz"', {
      execCommand() {
        return 'bar';
      },
    });
    delete (result as any).commands[0].name.expansion[0].commandAST;
    delete (result as any).commands[0].name.expansion[1].commandAST;

    // utils.logResults(result.commands[0]);
    utils.checkResults(result.commands[0], {
      type: 'Command',
      name: {
        text: 'foo bar bar baz',
        originalText: '"foo `other` `one` baz"',
        expansion: [{
          command: 'other',
          loc: { start: 5, end: 11 },
          resolved: true,
          type: 'CommandExpansion',
        }, {
          command: 'one',
          loc: { start: 13, end: 17 },
          resolved: true,
          type: 'CommandExpansion',
        }],
        type: 'Word',
      },
    });
  });

  await t.step('last newlines are removed from command output', async () => {
    const result = await bashParser('"foo $(other) baz"', {
      execCommand() {
        return 'bar\n\n';
      },
    });
    delete (result as any).commands[0].name.expansion[0].commandAST;
    // utils.logResults(result)
    utils.checkResults(result.commands[0], {
      type: 'Command',
      name: {
        text: 'foo bar baz',
        originalText: '"foo $(other) baz"',
        expansion: [{
          command: 'other',
          loc: { start: 5, end: 12 },
          resolved: true,
          type: 'CommandExpansion',
        }],
        type: 'Word',
      },
    });
  });

  await t.step('field splitting', async () => {
    const result = await bashParser('say $(other) plz', {
      execCommand() {
        return 'foo\tbar baz';
      },

      resolveEnv() {
        return '\t ';
      },
    });

    // utils.logResults(result)

    delete (result as any).commands[0].suffix[0].expansion[0].commandAST;
    delete (result as any).commands[0].suffix[1].expansion[0].commandAST;
    delete (result as any).commands[0].suffix[2].expansion[0].commandAST;

    utils.checkResults(result.commands[0], {
      type: 'Command',
      name: {
        text: 'say',
        type: 'Word',
      },
      suffix: [{
        text: 'foo',
        expansion: [{
          command: 'other',
          loc: { start: 0, end: 7 },
          type: 'CommandExpansion',
          resolved: true,
        }],
        originalText: '$(other)',
        type: 'Word',
        joined: 'foo\u0000bar\u0000baz',
        fieldIdx: 0,
      }, {
        text: 'bar',
        expansion: [{
          command: 'other',
          loc: { start: 0, end: 7 },
          type: 'CommandExpansion',
          resolved: true,
        }],
        originalText: '$(other)',
        type: 'Word',
        joined: 'foo\u0000bar\u0000baz',
        fieldIdx: 1,
      }, {
        text: 'baz',
        expansion: [{
          command: 'other',
          loc: { start: 0, end: 7 },
          type: 'CommandExpansion',
          resolved: true,
        }],
        originalText: '$(other)',
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
