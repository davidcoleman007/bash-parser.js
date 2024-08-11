export default {
  sourceCode: '"foo ${other} baz"',
  options: {
    resolveParameter: async () => {
      return 'bar';
    },
  },
  result: {
    type: 'Script',
    commands: [
      {
        type: 'Command',
        name: {
          text: 'foo bar baz',
          expansion: [
            {
              loc: {
                start: 5,
                end: 12,
              },
              parameter: 'other',
              type: 'ParameterExpansion',
              resolved: true,
            },
          ],
          originalText: '"foo ${other} baz"',
          type: 'Word',
        },
      },
    ],
  },
};
