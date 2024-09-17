import bashParser from '~/parse.ts';
import { assertRejects } from '~/utils/assert';
import utils from './_utils.ts';

function testUnclosed(cmd: string, char: string) {
  return async () => {
    assertRejects(
      () => bashParser(cmd),
      SyntaxError,
      'Unclosed ' + char,
    );
  };
}

describe('quoting', async (t) => {
  it('throws on unclosed double quotes', testUnclosed('echo "TEST1', '"'));
  it('throws on unclosed single quotes', testUnclosed("echo 'TEST1", "'"));
  it('throws on unclosed command subst', testUnclosed('echo $(TEST1', '$('));
  it('throws on unclosed backtick command subst', testUnclosed('echo `TEST1', '`'));
  it('throws on unclosed arhit subst', testUnclosed('echo $((TEST1', '$(('));
  it('throws on unclosed param subst', testUnclosed('echo ${TEST1', '${'));

  it('quotes within double quotes', async () => {
    const result = await bashParser('echo "TEST1 \'TEST2"');
    // utils.logResults(result)
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Command',
        name: { type: 'Word', text: 'echo' },
        suffix: [{ type: 'Word', text: "TEST1 'TEST2" }],
      }],
    });
  });

  it('escaped double quotes within double quotes', async () => {
    const result = await bashParser('echo "TEST1 \\"TEST2"');

    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Command',
        name: { type: 'Word', text: 'echo' },
        suffix: [{ type: 'Word', text: 'TEST1 "TEST2' }],
      }],
    });
  });

  it('double quotes within single quotes', async () => {
    const result = await bashParser("echo 'TEST1 \"TEST2'");
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Command',
        name: { type: 'Word', text: 'echo' },
        suffix: [{ type: 'Word', text: 'TEST1 "TEST2' }],
      }],
    });
  });

  it('Partially quoted word', async () => {
    const result = await bashParser("echo TEST1' TEST2 'TEST3");
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Command',
        name: { type: 'Word', text: 'echo' },
        suffix: [{ type: 'Word', text: 'TEST1 TEST2 TEST3' }],
      }],
    });
  });

  it('Partially double quoted word', async () => {
    const result = await bashParser('echo TEST3" TEST4 "TEST5');

    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Command',
        name: { type: 'Word', text: 'echo' },
        suffix: [{ type: 'Word', text: 'TEST3 TEST4 TEST5' }],
      }],
    });
  });
});
