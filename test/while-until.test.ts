import bashParser from '~/parse.ts';
import utils from './_utils.ts';

describe('while-until', async (t) => {
  it('parse while', async () => {
    const result = await bashParser('while true; do sleep 1; done');

    utils.checkResults(
      result,
      {
        type: 'Script',
        commands: [{
          type: 'While',
          clause: {
            type: 'CompoundList',
            commands: [{
              type: 'Command',
              name: { type: 'Word', text: 'true' },
            }],
          },
          do: {
            type: 'CompoundList',
            commands: [{
              type: 'Command',
              name: { type: 'Word', text: 'sleep' },
              suffix: [{ type: 'Word', text: '1' }],
            }],
          },
        }],
      },
    );
  });

  it('parse until', async () => {
    const result = await bashParser('until true; do sleep 1; done');
    // console.log(inspect(result, {depth:null}))
    utils.checkResults(
      result,
      {
        type: 'Script',
        commands: [{
          type: 'Until',
          clause: {
            type: 'CompoundList',
            commands: [{
              type: 'Command',
              name: { type: 'Word', text: 'true' },
            }],
          },
          do: {
            type: 'CompoundList',
            commands: [{
              type: 'Command',
              name: { type: 'Word', text: 'sleep' },
              suffix: [{ type: 'Word', text: '1' }],
            }],
          },
        }],
      },
    );
  });
});
