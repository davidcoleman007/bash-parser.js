export default {
  sourceCode: 'echo ciao',
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
            text: 'ciao',
            type: 'Word',
          },
        ],
      },
    ],
  },
};
