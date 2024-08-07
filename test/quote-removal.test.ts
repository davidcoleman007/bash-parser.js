import bashParser from '~/parse.ts';
import utils from './_utils.ts';

Deno.test('quote-removal', async (t) => {
  await t.step('remove double quote from string', () => {
    const result = bashParser('"echo"');
    utils.checkResults(result.commands[0].name, {
      type: 'Word',
      text: 'echo',
    });
  });

  await t.step('remove single quotes from string', () => {
    const result = bashParser("'echo'");
    utils.checkResults(result.commands[0].name, {
      type: 'Word',
      text: 'echo',
    });
  });

  await t.step('remove unnecessary slashes from string', () => {
    const result = bashParser('ec\\%ho');
    utils.checkResults(result.commands[0].name, {
      type: 'Word',
      text: 'ec%ho',
    });
  });

  await t.step('not remove quotes from middle of string if escaped', () => {
    const result = bashParser('ec\\\'\\"ho');
    utils.checkResults(result.commands[0].name, {
      type: 'Word',
      text: 'ec\'"ho',
    });
  });

  await t.step('transform escaped characters', () => {
    const result = bashParser('"ec\\t\\nho"');
    utils.checkResults(result.commands[0].name, {
      type: 'Word',
      text: 'ec\t\nho',
    });
  });

  await t.step('not remove special characters', () => {
    const result = bashParser('"ec\tho"');
    utils.checkResults(result.commands[0].name, {
      type: 'Word',
      text: 'ec\tho',
    });
  });

  await t.step('remove quotes from middle of string', () => {
    const result = bashParser("ec'h'o");
    utils.checkResults(result.commands[0].name, {
      type: 'Word',
      text: 'echo',
    });
  });

  await t.step('remove quotes on assignment', () => {
    const result = bashParser('echo="ciao mondo"');
    utils.checkResults(result.commands[0].prefix[0], {
      text: 'echo=ciao mondo',
      type: 'AssignmentWord',
    });
  });

  await t.step('remove quotes followed by single quotes', () => {
    const result = bashParser('echo"ciao"\'mondo\'');
    utils.checkResults(result.commands[0].name, {
      text: 'echociaomondo',
      type: 'Word',
    });
  });

  await t.step('remove single quotes followed by quotes', () => {
    const result = bashParser('echo\'ciao\'"mondo"');
    utils.checkResults(result.commands[0].name, {
      text: 'echociaomondo',
      type: 'Word',
    });
  });
});
