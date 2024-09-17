import bashParser from '~/parse.ts';
import utils from './_utils.ts';

describe('function', async (t) => {
  it('parse function declaration multiple lines', async () => {
    const result = await bashParser('foo () \n{\n command bar --lol;\n}');

    utils.checkResults(
      result,
      {
        type: 'Script',
        commands: [{
          type: 'Function',
          name: { type: 'Name', text: 'foo' },
          body: {
            type: 'CompoundList',
            commands: [{
              type: 'Command',
              name: { type: 'Word', text: 'command' },
              suffix: [{ type: 'Word', text: 'bar' }, { type: 'Word', text: '--lol' }],
            }],
          },
        }],
      },
    );
  });

  it('parse function declaration with redirections', async () => {
    const src = `foo () {
     command bar --lol;
    } > file.txt`;

    const result = await bashParser(src);

    utils.checkResults(
      result,
      {
        type: 'Script',
        commands: [{
          type: 'Function',
          name: { type: 'Name', text: 'foo' },
          redirections: [{
            type: 'Redirect',
            op: { type: 'Great', text: '>' },
            file: { type: 'Word', text: 'file.txt' },
          }],
          body: {
            type: 'CompoundList',
            commands: [{
              type: 'Command',
              name: { type: 'Word', text: 'command' },
              suffix: [{ type: 'Word', text: 'bar' }, { type: 'Word', text: '--lol' }],
            }],
          },
        }],
      },
    );
  });

  it('parse function declaration', async () => {
    const result = await bashParser('foo	(){ command bar --lol;  }');

    utils.checkResults(
      result,
      {
        type: 'Script',
        commands: [{
          type: 'Function',
          name: { type: 'Name', text: 'foo' },
          body: {
            type: 'CompoundList',
            commands: [{
              type: 'Command',
              name: { type: 'Word', text: 'command' },
              suffix: [{ type: 'Word', text: 'bar' }, { type: 'Word', text: '--lol' }],
            }],
          },
        }],
      },
    );
  });
});
