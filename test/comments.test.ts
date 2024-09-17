import bashParser from '~/parse.ts';
import utils from './_utils.ts';

describe('comments', async (t) => {
  it('loc take into account line continuations', async () => {
    const cmd = 'echo world #this is a comment\necho ciao';
    const result = await bashParser(cmd);

    const expected = {
      type: 'Script',
      commands: [{
        type: 'Command',
        name: {
          type: 'Word',
          text: 'echo',
        },
        suffix: [{
          type: 'Word',
          text: 'world',
        }],
      }, {
        type: 'Command',
        name: {
          type: 'Word',
          text: 'echo',
        },
        suffix: [{
          type: 'Word',
          text: 'ciao',
        }],
      }],
    };

    utils.checkResults(result, expected);
  });
});
