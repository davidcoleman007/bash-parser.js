export default {
  sourceCode: '! run | cry',
  result: {
    type: 'Script',
    commands: [
      {
        type: 'Pipeline',
        commands: [
          {
            type: 'SimpleCommand',
            name: {
              text: 'run',
              type: 'Word',
            },
          },
          {
            type: 'SimpleCommand',
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
