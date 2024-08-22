export default {
  sourceCode: '(echo) &',
  result: {
    type: 'Script',
    commands: [
      {
        type: 'Subshell',
        async: true,
        list: {
          type: 'CompoundList',
          commands: [
            {
              type: 'Command',
              name: {
                text: 'echo',
                type: 'Word',
              },
            },
          ],
        },
      },
    ],
  },
};
