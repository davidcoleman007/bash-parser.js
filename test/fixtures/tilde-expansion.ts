export default {
  sourceCode: 'a=~/subdir:~/othersubdir/ciao',
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
        prefix: [
          {
            text: 'a=/home/current/subdir:/home/current/othersubdir/ciao',
            type: 'AssignmentWord',
          },
        ],
      },
    ],
  },
};
