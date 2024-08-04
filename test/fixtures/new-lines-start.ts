export default {
  sourceCode: '\n\n\necho world',
  result: {
    type: 'Script',
    commands: [
      {
        type: 'SimpleCommand',
        name: {
          text: 'echo',
          type: 'Word',
        },
        suffix: [
          {
            text: 'world',
            type: 'Word',
          },
        ],
      },
    ],
  },
};
