import bashParser from '~/parse.ts';
import utils from './_utils.ts';

Deno.test('pathname-expansion', async (t) => {
  await t.step('parameter substitution in commands', () => {
    const result = bashParser('echo', {
      resolvePath() {
        return 'ciao';
      },
    });
    utils.checkResults((result as any).commands[0].name, {
      type: 'Word',
      text: 'ciao',
    });
  });

  await t.step('parameter substitution in assignment', () => {
    const result = bashParser('a=echo', {
      resolvePath() {
        return 'ciao';
      },
    });
    utils.checkResults((result as any).commands[0].prefix[0], {
      type: 'AssignmentWord',
      text: 'a=ciao',
    });
  });
});
