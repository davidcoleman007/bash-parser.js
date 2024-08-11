export default {
  sourceCode: '! run | cry',
  result: {
    type: 'Script',
    commands: [
      {
        type: 'Pipeline',
        commands: [
          {
            type: 'Command',
            name: {
              text: 'run',
              type: 'Word',
            },
          },
          {
            type: 'Command',
            name: {
              text: 'cry',
              type: 'Word',
            },
          },
        ],
        bang: true,
      },
    ],
  },
};
