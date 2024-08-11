export default {
  sourceCode: 'echo \\\n\n\necho there',
  result: {
    type: 'Script',
    commands: [
      {
        type: 'Command',
        name: {
          text: 'echo',
          type: 'Word',
        },
      },
      {
        type: 'Command',
        name: {
          text: 'echo',
          type: 'Word',
        },
        suffix: [
          {
            text: 'there',
            type: 'Word',
          },
        ],
      },
    ],
  },
};
