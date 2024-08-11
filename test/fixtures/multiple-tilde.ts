export default {
  sourceCode: 'echo ~/subdir/~other/',
  options: {
    resolveHomeUser: async () => {
      return '/home/current';
    },
  },
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
            text: '/home/current/subdir/~other/',
            type: 'Word',
          },
        ],
      },
    ],
  },
};
