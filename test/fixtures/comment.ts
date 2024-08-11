export default {
  sourceCode: 'echo world #this is a comment\necho ciao',
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
            text: 'world',
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
};
