import bashParser from '~/parse.ts';
import utils from './_utils.ts';

Deno.test('loc take into account line continuations', () => {
  const cmd = 'echo world #this is a comment\necho ciao';
  const result = bashParser(cmd);

  // utils.logResults(result);

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
