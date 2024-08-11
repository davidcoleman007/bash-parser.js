export default {
  sourceCode: 'foo=\'hello ; rm -rf /\'\ndest=bar\neval "dest=foo"',
  result: {
    type: 'Script',
    commands: [
      {
        type: 'Command',
        prefix: [
          {
            text: 'foo=hello ; rm -rf /',
            type: 'AssignmentWord',
          },
        ],
      },
      {
        type: 'Command',
        prefix: [
          {
            text: 'dest=bar',
            type: 'AssignmentWord',
          },
        ],
      },
      {
        type: 'Command',
        name: {
          text: 'eval',
          type: 'Word',
        },
        suffix: [
          {
            text: 'dest=foo',
            type: 'Word',
          },
        ],
      },
    ],
  },
};
