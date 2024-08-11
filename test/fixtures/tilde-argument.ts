export default {
  sourceCode: 'echo ~username/subdir',
  options: {
    resolveHomeUser: async (name: string) => {
      return `/home/${name}`;
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
            text: '/home/username/subdir',
            type: 'Word',
          },
        ],
      },
    ],
  },
};
