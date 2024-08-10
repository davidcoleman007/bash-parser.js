import bashParser from '~/parse.ts';
import utils from './_utils.ts';

// various example taken from http://www.etalabs.net/sh_tricks.html

Deno.test('fixtures', async (t) => {
  await t.step('2', async () => {
    const result = await bashParser('echo () { printf %s\\n "$*" ; }');
    // utils.logResults(result);
    utils.checkResults(result, {
      type: 'Script',
      commands: [
        {
          type: 'Function',
          name: {
            text: 'echo',
            type: 'Name',
          },
          body: {
            type: 'CompoundList',
            commands: [
              {
                type: 'Command',
                name: {
                  text: 'printf',
                  type: 'Word',
                },
                suffix: [
                  {
                    text: '%sn',
                    type: 'Word',
                  },
                  {
                    text: '"$*"',
                    expansion: [
                      {
                        kind: 'positional-string',
                        parameter: '*',
                        loc: {
                          start: 1,
                          end: 2,
                        },
                        type: 'ParameterExpansion',
                      },
                    ],
                    type: 'Word',
                  },
                ],
              },
            ],
          },
        },
      ],
    });
  });

  await t.step('3', async () => {
    const result = await bashParser('IFS= read -r var');
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Command',
        name: { type: 'Word', text: 'read' },
        prefix: [{ type: 'AssignmentWord', text: 'IFS=' }],
        suffix: [{ type: 'Word', text: '-r' }, { type: 'Word', text: 'var' }],
      }],
    });
  });

  await t.step('4', async () => {
    const result = await bashParser('foo | IFS= read var');
    // console.log(inspect(result, {depth: null}));

    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Pipeline',
        commands: [{
          type: 'Command',
          name: { type: 'Word', text: 'foo' },
        }, {
          type: 'Command',
          name: { type: 'Word', text: 'read' },
          prefix: [{ type: 'AssignmentWord', text: 'IFS=' }],
          suffix: [{ type: 'Word', text: 'var' }],
        }],
      }],
    });
  });

  await t.step('5', async () => {
    const result = await bashParser(
      `foo='hello ; rm -rf /'
dest=bar
eval "dest=foo"`,
    );

    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Command',
        prefix: [{ type: 'AssignmentWord', text: 'foo=hello ; rm -rf /' }],
      }, {
        type: 'Command',
        prefix: [{ type: 'AssignmentWord', text: 'dest=bar' }],
      }, {
        type: 'Command',
        name: { type: 'Word', text: 'eval' },
        suffix: [{ type: 'Word', text: 'dest=foo' }],
      }],
    });
  });
});
