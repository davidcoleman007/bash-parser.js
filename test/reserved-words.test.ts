import bashParser from '~/parse.ts';
import utils from './_utils.ts';

describe('reserved words', async (t) => {
  it('single quoted tokens are not parsed as reserved words', async () => {
    const result = await bashParser("'if' true");

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

  it('double quoted tokens are not parsed as reserved words', async () => {
    const result = await bashParser('"if" true');

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

  it('partially double quoted tokens are not parsed as reserved words', async () => {
    const result = await bashParser('i"f" true');

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

  it('partially single quoted tokens are not parsed as reserved words', async () => {
    const result = await bashParser("i'f' true");

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

  it('tokens in invalid positions are not parsed as reserved words', async () => {
    const result = await bashParser('echo if');

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
