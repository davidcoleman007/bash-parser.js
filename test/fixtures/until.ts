export default {
  sourceCode: 'until true; do sleep 1; done',
  result: {
    type: 'Script',
    commands: [
      {
        type: 'Until',
        clause: {
          type: 'CompoundList',
          commands: [
            {
              type: 'Command',
              name: {
                text: 'true',
                type: 'Word',
              },
            },
          ],
        },
        do: {
          type: 'CompoundList',
          commands: [
            {
              type: 'Command',
              name: {
                text: 'sleep',
                type: 'Word',
              },
              suffix: [
                {
                  text: '1',
                  type: 'Word',
                },
              ],
            },
          ],
        },
      },
    ],
  },
};
