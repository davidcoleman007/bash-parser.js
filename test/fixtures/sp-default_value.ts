export default {
  sourceCode: '${other:+default_value}',
  result: {
    type: 'Script',
    commands: [
      {
        type: 'Command',
        name: {
          text: '${other:+default_value}',
          expansion: [
            {
              loc: {
                start: 0,
                end: 22,
              },
              parameter: 'other',
              type: 'ParameterExpansion',
              op: 'useAlternativeValue',
              word: {
                text: 'default_value',
                type: 'Word',
              },
            },
          ],
          type: 'Word',
        },
      },
    ],
  },
};
