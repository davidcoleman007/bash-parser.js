export default {
  sourceCode: '2>&1 world',
  result: {
    type: 'Script',
    commands: [
      {
        type: 'Command',
        name: {
          text: 'world',
          type: 'Word',
        },
        prefix: [
          {
            type: 'Redirect',
            op: {
              text: '>&',
              type: 'GreatAnd',
            },
            file: {
              text: '1',
              type: 'Word',
            },
            numberIo: {
              text: '2',
              type: 'IoNumber',
            },
          },
        ],
      },
    ],
  },
};
