export default {
  sourceCode: '"foo $((42 * 42)) baz"',
  options: {
    runArithmeticExpression: async () => {
      return '43';
    },
  },
  result: {
    type: 'Script',
    commands: [
      {
        type: 'Command',
        name: {
          text: 'foo 43 baz',
          expansion: [
            {
              loc: {
                start: 5,
                end: 16,
              },
              type: 'ArithmeticExpansion',
              expression: '42 * 42',
              arithmeticAST: {
                type: 'BinaryExpression',
                start: 0,
                end: 7,
                loc: {
                  start: {
                    line: 1,
                    column: 0,
                    index: 0,
                  },
                  end: {
                    line: 1,
                    column: 7,
                    index: 7,
                  },
                },
                left: {
                  type: 'NumericLiteral',
                  start: 0,
                  end: 2,
                  loc: {
                    start: {
                      line: 1,
                      column: 0,
                      index: 0,
                    },
                    end: {
                      line: 1,
                      column: 2,
                      index: 2,
                    },
                  },
                  extra: {
                    rawValue: 42,
                    raw: '42',
                  },
                  value: 42,
                },
                operator: '*',
                right: {
                  type: 'NumericLiteral',
                  start: 5,
                  end: 7,
                  loc: {
                    start: {
                      line: 1,
                      column: 5,
                      index: 5,
                    },
                    end: {
                      line: 1,
                      column: 7,
                      index: 7,
                    },
                  },
                  extra: {
                    rawValue: 42,
                    raw: '42',
                  },
                  value: 42,
                },
              },
              resolved: true,
            },
          ],
          originalText: '"foo $((42 * 42)) baz"',
          type: 'Word',
        },
      },
    ],
  },
};
