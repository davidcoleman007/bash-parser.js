import bashParser from '~/parse.ts';
import utils from './_utils.ts';

describe('pathname-expansion', async (t) => {
  it('parameter substitution in commands', async () => {
    const result = await bashParser('echo', {
      async resolvePath() {
        return 'ciao';
      },
    });
    utils.checkResults((result as any).commands[0].name, {
      type: 'Word',
      text: 'ciao',
    });
  });

  it('parameter substitution in assignment', async () => {
    const result = await bashParser('a=echo', {
      async resolvePath() {
        return 'ciao';
      },
    });
    utils.checkResults((result as any).commands[0].prefix[0], {
      type: 'AssignmentWord',
      text: 'a=ciao',
    });
  });
});
