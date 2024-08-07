import bashParser from '~/parse.ts';
import utils from './_utils.ts';

Deno.test('reserved words', async (t) => {
  await t.step('single quoted tokens are not parsed as reserved words', () => {
    const result = bashParser("'if' true");
    // utils.logResults(result);

    utils.checkResults(result, {
      type: 'Script',
      commands: [
        {
          type: 'Command',
          name: {
            text: 'if',
            type: 'Word',
          },
          suffix: [
            {
              text: 'true',
              type: 'Word',
            },
          ],
        },
      ],
    });
  });

  await t.step('double quoted tokens are not parsed as reserved words', () => {
    const result = bashParser('"if" true');
    // utils.logResults(result);

    utils.checkResults(result, {
      type: 'Script',
      commands: [
        {
          type: 'Command',
          name: {
            text: 'if',
            type: 'Word',
          },
          suffix: [
            {
              text: 'true',
              type: 'Word',
            },
          ],
        },
      ],
    });
  });

  await t.step('partially double quoted tokens are not parsed as reserved words', () => {
    const result = bashParser('i"f" true');
    // utils.logResults(result);

    utils.checkResults(result, {
      type: 'Script',
      commands: [
        {
          type: 'Command',
          name: {
            text: 'if',
            type: 'Word',
          },
          suffix: [
            {
              text: 'true',
              type: 'Word',
            },
          ],
        },
      ],
    });
  });

  await t.step('partially single quoted tokens are not parsed as reserved words', () => {
    const result = bashParser("i'f' true");
    // utils.logResults(result);

    utils.checkResults(result, {
      type: 'Script',
      commands: [
        {
          type: 'Command',
          name: {
            text: 'if',
            type: 'Word',
          },
          suffix: [
            {
              text: 'true',
              type: 'Word',
            },
          ],
        },
      ],
    });
  });

  await t.step('tokens in invalid positions are not parsed as reserved words', () => {
    const result = bashParser('echo if');
    // utils.logResults(result);

    utils.checkResults(result, {
      type: 'Script',
      commands: [
        {
          type: 'Command',
          name: {
            text: 'echo',
            type: 'Word',
          },
          suffix: [
            {
              text: 'if',
              type: 'Word',
            },
          ],
        },
      ],
    });
  });
});
