import bashParser from '~/parse.ts';
import utils from './_utils.ts';

Deno.test('ast', async (t) => {
  await t.step('command with one argument', async () => {
    const result = await bashParser('echo world');
    // utils.logResults(result)
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Command',
        name: { type: 'Word', text: 'echo' },
        suffix: [{ type: 'Word', text: 'world' }],
      }],
    });
  });

  await t.step('command with multiple new lines', async () => {
    const result = await bashParser('\n\n\necho world');
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Command',
        name: { type: 'Word', text: 'echo' },
        suffix: [{ type: 'Word', text: 'world' }],
      }],
    });
  });

  await t.step('command with multiple lines continuation', async () => {
    const result = await bashParser('echo \\\n\\\n\\\n\\\nthere');
    // utils.logResults(result);
    utils.checkResults((result as any).commands[0].suffix[0], {
      text: 'there',
      type: 'Word',
    });
  });

  await t.step('command with pre-assignment', async () => {
    const result = await bashParser('TEST=1 run');
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Command',
        name: { type: 'Word', text: 'run' },
        prefix: [{ type: 'AssignmentWord', text: 'TEST=1' }],
      }],
    });
  });

  await t.step('assignment alone', async () => {
    const result = await bashParser('TEST=1');
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Command',
        prefix: [{ type: 'AssignmentWord', text: 'TEST=1' }],
      }],
    });
  });

  await t.step('commands with AND', async () => {
    const result = await bashParser('run && stop');
    // utils.logResults(result)
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'LogicalExpression',
        op: 'and',
        left: { type: 'Command', name: { type: 'Word', text: 'run' } },
        right: { type: 'Command', name: { type: 'Word', text: 'stop' } },
      }],
    });
  });

  await t.step('commands with AND \\n', async () => {
    const result = await bashParser('run && \n stop');
    // console.log(inspect(result, {depth: null}))
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'LogicalExpression',
        op: 'and',
        left: { type: 'Command', name: { type: 'Word', text: 'run' } },
        right: { type: 'Command', name: { type: 'Word', text: 'stop' } },
      }],
    });
  });

  await t.step('commands with OR', async () => {
    const result = await bashParser('run || cry');
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'LogicalExpression',
        op: 'or',
        left: { type: 'Command', name: { type: 'Word', text: 'run' } },
        right: { type: 'Command', name: { type: 'Word', text: 'cry' } },
      }],
    });
  });

  await t.step('pipelines', async () => {
    const result = await bashParser('run | cry');
    // console.log(inspect(result, {depth: null}));
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Pipeline',
        commands: [
          { type: 'Command', name: { type: 'Word', text: 'run' } },
          { type: 'Command', name: { type: 'Word', text: 'cry' } },
        ],
      }],
    });
  });

  await t.step('bang pipelines', async () => {
    const result = await bashParser('! run | cry');
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Pipeline',
        bang: true,
        commands: [
          { type: 'Command', name: { type: 'Word', text: 'run' } },
          { type: 'Command', name: { type: 'Word', text: 'cry' } },
        ],
      }],
    });
  });

  await t.step('no pre-assignment on suffix', async () => {
    const result = await bashParser('echo TEST=1');
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Command',
        name: { type: 'Word', text: 'echo' },
        suffix: [{ type: 'Word', text: 'TEST=1' }],
      }],
    });
  });

  await t.step('command with multiple prefixes', async () => {
    const result = await bashParser('TEST1=1 TEST2=2 echo world');
    // utils.logResults(result)
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Command',
        name: { type: 'Word', text: 'echo' },
        prefix: [
          { type: 'AssignmentWord', text: 'TEST1=1' },
          { type: 'AssignmentWord', text: 'TEST2=2' },
        ],
        suffix: [{ type: 'Word', text: 'world' }],
      }],
    });
  });

  await t.step('multi line commands', async () => {
    const result = await bashParser('echo; \nls;\n');
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Command',
        name: { type: 'Word', text: 'echo' },
      }, {
        type: 'Command',
        name: { type: 'Word', text: 'ls' },
      }],
    });
  });

  await t.step('Compound list', async () => {
    const result = await bashParser('{ echo; ls; }');
    // utils.logResults(result);
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'CompoundList',
        commands: [{
          type: 'Command',
          name: { text: 'echo', type: 'Word' },
        }, {
          type: 'Command',
          name: { text: 'ls', type: 'Word' },
        }],
      }],
    });
  });

  await t.step('Compound list with redirections', async () => {
    const result = await bashParser('{ echo; ls; } > file.txt');
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'CompoundList',
        commands: [{
          type: 'Command',
          name: { text: 'echo', type: 'Word' },
        }, {
          type: 'Command',
          name: { text: 'ls', type: 'Word' },
        }],
        redirections: [{
          type: 'Redirect',
          op: { type: 'great', text: '>' },
          file: { type: 'Word', text: 'file.txt' },
        }],
      }],
    });
  });

  await t.step('command with multiple redirections', async () => {
    const result = await bashParser('echo world > file.txt < input.dat');

    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Command',
        name: { type: 'Word', text: 'echo' },
        suffix: [{
          type: 'Word',
          text: 'world',
        }, {
          type: 'Redirect',
          op: { type: 'great', text: '>' },
          file: { type: 'Word', text: 'file.txt' },
        }, {
          type: 'Redirect',
          op: { type: 'less', text: '<' },
          file: { type: 'Word', text: 'input.dat' },
        }],
      }],
    });
  });

  await t.step('Compound list with multiple redirections', async () => {
    const result = await bashParser('{ echo; ls; } > file.txt < input.dat');
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'CompoundList',
        commands: [{
          type: 'Command',
          name: { text: 'echo', type: 'Word' },
        }, {
          type: 'Command',
          name: { text: 'ls', type: 'Word' },
        }],
        redirections: [{
          type: 'Redirect',
          op: { type: 'great', text: '>' },
          file: { type: 'Word', text: 'file.txt' },
        }, {
          type: 'Redirect',
          op: { type: 'less', text: '<' },
          file: { type: 'Word', text: 'input.dat' },
        }],
      }],
    });
  });

  await t.step('single line commands', async () => {
    const result = await bashParser('echo;ls');
    // utils.logResults(result)
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Command',
        name: { type: 'Word', text: 'echo' },
      }, {
        type: 'Command',
        name: { type: 'Word', text: 'ls' },
      }],
    });
  });

  await t.step('single line commands separated by &', async () => {
    const result = await bashParser('echo&ls');
    // utils.logResults(result)
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Command',
        async: true,
        name: { type: 'Word', text: 'echo' },
      }, {
        type: 'Command',
        name: { type: 'Word', text: 'ls' },
      }],
    });
  });

  await t.step('LogicalExpression separated by &', async () => {
    const result = await bashParser('echo && ls &');
    // utils.logResults(result)
    utils.checkResults(result, {
      type: 'Script',
      commands: [
        {
          type: 'LogicalExpression',
          op: 'and',
          left: {
            type: 'Command',
            name: {
              text: 'echo',
              type: 'Word',
            },
          },
          right: {
            type: 'Command',
            name: {
              text: 'ls',
              type: 'Word',
            },
          },
          async: true,
        },
      ],
    });
  });

  await t.step('LogicalExpressions separated by &', async () => {
    const result = await bashParser('echo && ls & ciao');
    utils.checkResults(result, {
      type: 'Script',
      commands: [
        {
          type: 'LogicalExpression',
          op: 'and',
          left: {
            type: 'Command',
            name: {
              text: 'echo',
              type: 'Word',
            },
          },
          right: {
            type: 'Command',
            name: {
              text: 'ls',
              type: 'Word',
            },
          },
          async: true,
        },
        {
          type: 'Command',
          name: {
            text: 'ciao',
            type: 'Word',
          },
        },
      ],
    });
  });

  await t.step('single line commands separated by &;', async () => {
    const result = await bashParser('echo&;ls');
    // utils.logResults(result)
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Command',
        async: true,
        name: { type: 'Word', text: 'echo' },
      }, {
        type: 'Command',
        name: { type: 'Word', text: 'ls' },
      }],
    });
  });

  await t.step('command with redirection to file', async () => {
    const result = await bashParser('ls > file.txt');
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Command',
        name: { type: 'Word', text: 'ls' },
        suffix: [{
          type: 'Redirect',
          op: { type: 'great', text: '>' },
          file: { type: 'Word', text: 'file.txt' },
        }],
      }],
    });
  });

  await t.step('parse multiple suffix', async () => {
    const result = await bashParser('command foo --lol');
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Command',
        name: { type: 'Word', text: 'command' },
        suffix: [{ type: 'Word', text: 'foo' }, { type: 'Word', text: '--lol' }],
      }],
    });
  });

  await t.step('command with stderr redirection to file', async () => {
    const result = await bashParser('ls 2> file.txt');
    // utils.logResults(result);
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Command',
        name: { type: 'Word', text: 'ls' },
        suffix: [{
          type: 'Redirect',
          op: { type: 'great', text: '>' },
          file: { type: 'Word', text: 'file.txt' },
          numberIo: { type: 'io_number', text: '2' },
        }],
      }],
    });
  });

  await t.step('parse subshell', async () => {
    const result = await bashParser('( ls )');

    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Subshell',
        list: {
          type: 'CompoundList',
          commands: [{ type: 'Command', name: { type: 'Word', text: 'ls' } }],
        },
      }],
    });
  });
});
