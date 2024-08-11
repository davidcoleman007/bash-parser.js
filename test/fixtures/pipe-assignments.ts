export default {
  sourceCode: 'foo | IFS= read var',
  result: {
    type: 'Script',
    commands: [
      {
        type: 'Pipeline',
        commands: [
          {
            type: 'Command',
            name: {
              text: 'foo',
              type: 'Word',
            },
          },
          {
            type: 'Command',
            name: {
              text: 'read',
              type: 'Word',
            },
            prefix: [
              {
                text: 'IFS=',
                type: 'AssignmentWord',
              },
            ],
            suffix: [
              {
                text: 'var',
                type: 'Word',
              },
            ],
          },
        ],
      },
    ],
  },
};
