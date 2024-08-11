export default {
  sourceCode: 'run && \n stop',
  result: {
    type: 'Script',
    commands: [
      {
        type: 'LogicalExpression',
        op: 'and',
        left: {
          type: 'Command',
          name: {
            text: 'run',
            type: 'Word',
          },
        },
        right: {
          type: 'Command',
          name: {
            text: 'stop',
            type: 'Word',
          },
        },
      },
    ],
  },
};
