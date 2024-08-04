import bashParser from '~/parse.ts';
import utils from './_utils.ts';

Deno.test('parse for', () => {
  const result = bashParser('for x in a b c; do echo $x; done');
  // utils.logResults(result)
  utils.checkResults(
    result,
    {
      type: 'Script',
      commands: [{
        type: 'For',
        name: { type: 'Name', text: 'x' },
        wordlist: [{ type: 'Word', text: 'a' }, { type: 'Word', text: 'b' }, { type: 'Word', text: 'c' }],
        do: {
          type: 'CompoundList',
          commands: [{
            type: 'Command',
            name: { type: 'Word', text: 'echo' },
            suffix: [{
              type: 'Word',
              text: '$x',
              expansion: [{
                type: 'ParameterExpansion',
                parameter: 'x',
                loc: {
                  start: 0,
                  end: 1,
                },
              }],
            }],
          }],
        },
      }],
    },
  );
});

Deno.test('parse for with default sequence', () => {
  const result = bashParser('for x\n do echo $x\n done');
  // utils.logResults(result)
  utils.checkResults(
    result,
    {
      type: 'Script',
      commands: [{
        type: 'For',
        name: { type: 'Name', text: 'x' },
        do: {
          type: 'CompoundList',
          commands: [{
            type: 'Command',
            name: { type: 'Word', text: 'echo' },
            suffix: [{
              type: 'Word',
              text: '$x',
              expansion: [{
                type: 'ParameterExpansion',
                parameter: 'x',
                loc: {
                  start: 0,
                  end: 1,
                },
              }],
            }],
          }],
        },
      }],
    },
  );
});

Deno.test('parse for with default sequence - on one line', () => {
  const result = bashParser('for x in; do echo $x; done');
  // utils.logResults(result)
  utils.checkResults(
    result,
    {
      type: 'Script',
      commands: [{
        type: 'For',
        name: { type: 'Name', text: 'x' },
        do: {
          type: 'CompoundList',
          commands: [{
            type: 'Command',
            name: { type: 'Word', text: 'echo' },
            suffix: [{
              type: 'Word',
              text: '$x',
              expansion: [{
                type: 'ParameterExpansion',
                parameter: 'x',
                loc: {
                  start: 0,
                  end: 1,
                },
              }],
            }],
          }],
        },
      }],
    },
  );
});
