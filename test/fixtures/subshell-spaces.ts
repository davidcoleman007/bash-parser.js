export default {
  sourceCode: '( ls )',
  result: {
    type: 'Script',
    commands: [
      {
        type: 'Subshell',
        list: {
          type: 'CompoundList',
          commands: [
            {
              type: 'Command',
              name: {
                text: 'ls',
                type: 'Word',
              },
            },
          ],
        },
      },
    ],
  },
};
