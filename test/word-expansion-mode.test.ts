import bashParser from '~/parse.ts';
import utils from './_utils.ts';

describe('word-expansion-mode', async (t) => {
  it('expand on a single word', async () => {
    const result = await bashParser('ls $var > res.txt', {
      mode: 'word-expansion',
    });

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
