export default {
  sourceCode: 'echo="ciao mondo"',
  result: {
    type: 'Script',
    commands: [
      {
        type: 'Command',
        prefix: [
          {
            text: 'echo=ciao mondo',
            type: 'AssignmentWord',
          },
        ],
      },
    ],
  },
};
