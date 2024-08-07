import bashParser from '~/parse.ts';
import utils from './_utils.ts';

Deno.test('parameter-substitution', async (t) => {
  await t.step('parameter substitution in assignment', () => {
    const result = bashParser('echoword=${other}test');
    // utils.logResults(result);
    utils.checkResults(result.commands[0].prefix, [{
      type: 'AssignmentWord',
      text: 'echoword=${other}test',
      expansion: [{
        type: 'ParameterExpansion',
        parameter: 'other',
        loc: {
          start: 9,
          end: 16,
        },
      }],
    }]);
  });

  await t.step('parameter substitution skip escaped dollar', () => {
    const result = bashParser('echo "\\$ciao"');
    utils.checkResults(result.commands[0].suffix, [{ type: 'Word', text: '\\$ciao' }]);
  });

  await t.step('parameter substitution skip escaped dollar with braces', () => {
    const result = bashParser('echo "\\${ciao}"');
    utils.checkResults(result.commands[0].suffix, [{ type: 'Word', text: '\\${ciao}' }]);
  });

  await t.step('parameter substitution skip single quoted words', () => {
    const result = bashParser("echo '${echo } $ciao'");
    // utils.logResults(result)
    utils.checkResults(result.commands[0].suffix, [{
      type: 'Word',
      text: '${echo } $ciao',
    }]);
  });

  await t.step('parameter substitution and other words', () => {
    const result = bashParser('foo ${other} bar baz');
    // utils.logResults(result);
    utils.checkResults(result.commands[0].suffix, [{
      text: '${other}',
      expansion: [{
        parameter: 'other',
        loc: {
          start: 0,
          end: 7,
        },
        type: 'ParameterExpansion',
      }],
      type: 'Word',
    }, {
      text: 'bar',
      type: 'Word',
    }, {
      text: 'baz',
      type: 'Word',
    }]);
  });

  await t.step('multi-word parameter substitution', () => {
    const result = bashParser('echoword=${other word}test');
    // utils.logResults(result);

    utils.checkResults(result.commands[0].prefix, [{
      type: 'AssignmentWord',
      text: 'echoword=${other word}test',
      expansion: [{
        type: 'ParameterExpansion',
        parameter: 'other word',
        loc: {
          start: 9,
          end: 21,
        },
      }],
    }]);
  });

  await t.step('parameter substitution', () => {
    const result = bashParser('echo word${other}test');
    utils.checkResults(result.commands[0].suffix, [{
      type: 'Word',
      text: 'word${other}test',
      expansion: [{
        type: 'ParameterExpansion',
        parameter: 'other',
        loc: {
          start: 4,
          end: 11,
        },
      }],
    }]);
  });

  await t.step('multiple parameter substitution', () => {
    const result = bashParser('echo word${other}t$est');
    utils.checkResults(result.commands[0].suffix, [{
      type: 'Word',
      text: 'word${other}t$est',
      expansion: [{
        type: 'ParameterExpansion',
        parameter: 'other',
        loc: {
          start: 4,
          end: 11,
        },
      }, {
        type: 'ParameterExpansion',
        parameter: 'est',
        loc: {
          start: 13,
          end: 16,
        },
      }],
    }]);
  });

  await t.step('command consisting of only parameter substitution', () => {
    const result = bashParser('$other');
    // utils.logResults(result)
    utils.checkResults(result.commands[0].name, {
      type: 'Word',
      text: '$other',
      expansion: [{
        type: 'ParameterExpansion',
        parameter: 'other',
        loc: {
          start: 0,
          end: 5,
        },
      }],
    });
  });

  await t.step('resolve parameter', () => {
    const result = bashParser('"foo ${other} baz"', {
      resolveParameter() {
        return 'bar';
      },
    });
    // utils.logResults(result.commands[0]);
    utils.checkResults(result.commands[0], {
      type: 'Command',
      name: {
        text: 'foo bar baz',
        originalText: '"foo ${other} baz"',
        expansion: [
          {
            parameter: 'other',
            loc: {
              start: 5,
              end: 12,
            },
            resolved: true,
            type: 'ParameterExpansion',
          },
        ],
        type: 'Word',
      },
    });
  });

  await t.step('resolve double parameter', () => {
    const result = bashParser('"foo ${other} ${one} baz"', {
      resolveParameter() {
        return 'bar';
      },
    });
    // utils.logResults(result);
    utils.checkResults(result.commands[0], {
      type: 'Command',
      name: {
        text: 'foo bar bar baz',
        originalText: '"foo ${other} ${one} baz"',
        expansion: [{
          parameter: 'other',
          loc: {
            start: 5,
            end: 12,
          },
          resolved: true,
          type: 'ParameterExpansion',
        }, {
          parameter: 'one',
          loc: {
            start: 14,
            end: 19,
          },
          resolved: true,
          type: 'ParameterExpansion',
        }],
        type: 'Word',
      },
    });
  });

  await t.step('field splitting', () => {
    const result = bashParser('say ${other} plz', {
      resolveParameter() {
        return 'foo\tbar baz';
      },

      resolveEnv() {
        return '\t ';
      },
    });
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
          parameter: 'other',
          loc: {
            start: 0,
            end: 7,
          },
          type: 'ParameterExpansion',
          resolved: true,
        }],
        originalText: '${other}',
        type: 'Word',
        joined: 'foo\u0000bar\u0000baz',
        fieldIdx: 0,
      }, {
        text: 'bar',
        expansion: [{
          parameter: 'other',
          loc: {
            start: 0,
            end: 7,
          },
          type: 'ParameterExpansion',
          resolved: true,
        }],
        originalText: '${other}',
        type: 'Word',
        joined: 'foo\u0000bar\u0000baz',
        fieldIdx: 1,
      }, {
        text: 'baz',
        expansion: [{
          parameter: 'other',
          loc: {
            start: 0,
            end: 7,
          },
          type: 'ParameterExpansion',
          resolved: true,
        }],
        originalText: '${other}',
        type: 'Word',
        joined: 'foo\u0000bar\u0000baz',
        fieldIdx: 2,
      }, {
        text: 'plz',
        type: 'Word',
      }],
    });
  });

  await t.step('field splitting not occurring within quoted words', () => {
    const result = bashParser('say "${other} plz"', {
      resolveParameter() {
        return 'foo\tbar baz';
      },

      resolveEnv() {
        return '\t ';
      },
    });
    // utils.logResults(result)
    utils.checkResults(result.commands[0], {
      type: 'Command',
      name: {
        text: 'say',
        type: 'Word',
      },
      suffix: [{
        text: 'foo\tbar baz plz',
        expansion: [{
          parameter: 'other',
          loc: {
            start: 1,
            end: 8,
          },
          type: 'ParameterExpansion',
          resolved: true,
        }],
        originalText: '"${other} plz"',
        type: 'Word',
      }],
    });
  });
});
