export default {
  sourceCode: '2>&1 world',
  result: {
    type: 'Script',
    commands: [
      {
        type: 'SimpleCommand',
        name: {
          text: 'test-value',
          type: 'Word',
        },
        prefix: [
          {
            type: 'Redirect',
            op: {
              text: '>&',
              type: 'greatand',
            },
            file: {
              text: '1',
              type: 'Word',
            },
            numberIo: {
              text: '2',
              type: 'io_number',
            },
          },
        ],
      },
    ],
  },
};
