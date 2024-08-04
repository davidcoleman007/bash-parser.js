import bashParser from '~/parse.ts';
import utils from './_utils.ts';

Deno.test('remove double quote from string', () => {
  const result = bashParser('"echo"');
  utils.checkResults(result.commands[0].name, {
    type: 'Word',
    text: 'echo',
  });
});

Deno.test('remove single quotes from string', () => {
  const result = bashParser("'echo'");
  utils.checkResults(result.commands[0].name, {
    type: 'Word',
    text: 'echo',
  });
});

Deno.test('remove unnecessary slashes from string', () => {
  const result = bashParser('ec\\%ho');
  utils.checkResults(result.commands[0].name, {
    type: 'Word',
    text: 'ec%ho',
  });
});

Deno.test('not remove quotes from middle of string if escaped', () => {
  const result = bashParser('ec\\\'\\"ho');
  utils.checkResults(result.commands[0].name, {
    type: 'Word',
    text: 'ec\'"ho',
  });
});

Deno.test('transform escaped characters', () => {
  const result = bashParser('"ec\\t\\nho"');
  utils.checkResults(result.commands[0].name, {
    type: 'Word',
    text: 'ec\t\nho',
  });
});

Deno.test('not remove special characters', () => {
  const result = bashParser('"ec\tho"');
  utils.checkResults(result.commands[0].name, {
    type: 'Word',
    text: 'ec\tho',
  });
});

Deno.test('remove quotes from middle of string', () => {
  const result = bashParser("ec'h'o");
  utils.checkResults(result.commands[0].name, {
    type: 'Word',
    text: 'echo',
  });
});

Deno.test('remove quotes on assignment', () => {
  const result = bashParser('echo="ciao mondo"');
  utils.checkResults(result.commands[0].prefix[0], {
    text: 'echo=ciao mondo',
    type: 'AssignmentWord',
  });
});

Deno.test('remove quotes followed by single quotes', () => {
  const result = bashParser('echo"ciao"\'mondo\'');
  utils.checkResults(result.commands[0].name, {
    text: 'echociaomondo',
    type: 'Word',
  });
});

Deno.test('remove single quotes followed by quotes', () => {
  const result = bashParser('echo\'ciao\'"mondo"');
  utils.checkResults(result.commands[0].name, {
    text: 'echociaomondo',
    type: 'Word',
  });
});
