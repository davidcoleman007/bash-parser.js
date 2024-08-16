export default {
  sourceCode: 'until true || 1; do sleep 1;echo ciao; done',
  result: {
    type: 'Script',
    commands: [
      {
        type: 'Until',
        clause: {
          type: 'CompoundList',
          commands: [
            {
              type: 'LogicalExpression',
              op: 'or',
              left: {
                type: 'Command',
                name: {
                  text: 'true',
                  type: 'Word',
                },
              },
              right: {
                type: 'Command',
                name: {
                  text: '1',
                  type: 'Word',
                },
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
            {
              type: 'Command',
              name: {
                text: 'echo',
                type: 'Word',
              },
              suffix: [
                {
                  text: 'ciao',
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
