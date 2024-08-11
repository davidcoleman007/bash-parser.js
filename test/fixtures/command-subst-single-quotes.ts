export default {
  sourceCode: "echo '`echo ciao`'",
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
            text: '`echo ciao`',
            type: 'Word',
          },
        ],
      },
    ],
  },
};
