import bashParser from '~/parse.ts';
import utils from './_utils.ts';

describe('quote-removal', async (t) => {
  it('remove double quote from string', async () => {
    const result = await bashParser('"echo"');
    utils.checkResults((result as any).commands[0].name, {
      type: 'Word',
      text: 'echo',
    });
  });

  it('remove single quotes from string', async () => {
    const result = await bashParser("'echo'");
    utils.checkResults((result as any).commands[0].name, {
      type: 'Word',
      text: 'echo',
    });
  });

  it('remove unnecessary slashes from string', async () => {
    const result = await bashParser('ec\\%ho');
    utils.checkResults((result as any).commands[0].name, {
      type: 'Word',
      text: 'ec%ho',
    });
  });

  it('not remove quotes from middle of string if escaped', async () => {
    const result = await bashParser('ec\\\'\\"ho');
    utils.checkResults((result as any).commands[0].name, {
      type: 'Word',
      text: 'ec\'"ho',
    });
  });

  it('transform escaped characters', async () => {
    const result = await bashParser('"ec\\t\\nho"');
    utils.checkResults((result as any).commands[0].name, {
      type: 'Word',
      text: 'ec\t\nho',
    });
  });

  it('not remove special characters', async () => {
    const result = await bashParser('"ec\tho"');
    utils.checkResults((result as any).commands[0].name, {
      type: 'Word',
      text: 'ec\tho',
    });
  });

  it('remove quotes from middle of string', async () => {
    const result = await bashParser("ec'h'o");
    utils.checkResults((result as any).commands[0].name, {
      type: 'Word',
      text: 'echo',
    });
  });

  it('remove quotes on assignment', async () => {
    const result = await bashParser('echo="ciao mondo"');
    utils.checkResults((result as any).commands[0].prefix[0], {
      text: 'echo=ciao mondo',
      type: 'AssignmentWord',
    });
  });

  it('remove quotes followed by single quotes', async () => {
    const result = await bashParser('echo"ciao"\'mondo\'');
    utils.checkResults((result as any).commands[0].name, {
      text: 'echociaomondo',
      type: 'Word',
    });
  });

  it('remove single quotes followed by quotes', async () => {
    const result = await bashParser('echo\'ciao\'"mondo"');
    utils.checkResults((result as any).commands[0].name, {
      text: 'echociaomondo',
      type: 'Word',
    });
  });
});
