import { assertEquals } from '@std/assert';
import bashParser from '~/parse.ts';
import utils from './_utils.ts';

function testUnclosed(cmd: string, char: string) {
  return () => {
    try {
      bashParser(cmd);
    } catch (e) {
      assertEquals(e instanceof SyntaxError, true);
      assertEquals(e.message, 'Unclosed ' + char);
    }
  };
}

Deno.test('throws on unclosed double quotes', testUnclosed('echo "TEST1', '"'));
Deno.test('throws on unclosed single quotes', testUnclosed("echo 'TEST1", "'"));
Deno.test('throws on unclosed command subst', testUnclosed('echo $(TEST1', '$('));
Deno.test('throws on unclosed backtick command subst', testUnclosed('echo `TEST1', '`'));
Deno.test('throws on unclosed arith subst', testUnclosed('echo $((TEST1', '$(('));
Deno.test('throws on unclosed param subst', testUnclosed('echo ${TEST1', '${'));

Deno.test('quotes within double quotes', () => {
  const result = bashParser('echo "TEST1 \'TEST2"');
  utils.checkResults(result, {
    type: 'Script',
    commands: [{
      type: 'Command',
      name: { type: 'Word', text: 'echo' },
      suffix: [{ type: 'Word', text: "TEST1 'TEST2" }],
    }],
  });
});

Deno.test('escaped double quotes within double quotes', () => {
  const result = bashParser('echo "TEST1 \\"TEST2"');
  utils.checkResults(result, {
    type: 'Script',
    commands: [{
      type: 'Command',
      name: { type: 'Word', text: 'echo' },
      suffix: [{ type: 'Word', text: 'TEST1 "TEST2' }],
    }],
  });
});

Deno.test('double quotes within single quotes', () => {
  const result = bashParser("echo 'TEST1 \"TEST2'");
  utils.checkResults(result, {
    type: 'Script',
    commands: [{
      type: 'Command',
      name: { type: 'Word', text: 'echo' },
      suffix: [{ type: 'Word', text: 'TEST1 "TEST2' }],
    }],
  });
});

Deno.test('Partially quoted word', () => {
  const result = bashParser("echo TEST1' TEST2 'TEST3");
  utils.checkResults(result, {
    type: 'Script',
    commands: [{
      type: 'Command',
      name: { type: 'Word', text: 'echo' },
      suffix: [{ type: 'Word', text: 'TEST1 TEST2 TEST3' }],
    }],
  });
});

Deno.test('Partially double quoted word', () => {
  const result = bashParser('echo TEST3" TEST4 "TEST5');
  utils.checkResults(result, {
    type: 'Script',
    commands: [{
      type: 'Command',
      name: { type: 'Word', text: 'echo' },
      suffix: [{ type: 'Word', text: 'TEST3 TEST4 TEST5' }],
    }],
  });
});
