import bashParser from '~/parse.ts';
import utils from './_utils.ts';

Deno.test('word-expansion-mode', async (t) => {
  await t.step('expand on a single word', () => {
    const result = bashParser('ls $var > res.txt', {
      mode: 'word-expansion',
    });
    // utils.logResults(result);
    utils.checkResults({
      type: 'Script',
      commands: [{
        type: 'Command',
        name: {
          type: 'Word',
          text: 'ls $var > res.txt',
          expansion: [{
            parameter: 'var',
            loc: {
              start: 3,
              end: 6,
            },
            type: 'ParameterExpansion',
          }],
        },
      }],
    }, result);
  });
});
