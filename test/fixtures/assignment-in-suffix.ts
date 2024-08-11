export default {
  sourceCode: 'echo TEST=1',
  result: {
    type: 'Script',
    commands: [
      {
        type: 'Command',
        name: {
          text: 'echo',
          type: 'Word',
        },
        suffix: [
          {
            text: 'TEST=1',
            type: 'Word',
          },
        ],
      },
    ],
  },
};
