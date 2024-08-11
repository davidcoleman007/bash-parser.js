export default {
  sourceCode: 'echo () { printf %s\\n "$*" ; }',
  result: {
    type: 'Script',
    commands: [
      {
        type: 'Function',
        name: {
          text: 'echo',
          type: 'Name',
        },
        body: {
          type: 'CompoundList',
          commands: [
            {
              type: 'Command',
              name: {
                text: 'printf',
                type: 'Word',
              },
              suffix: [
                {
                  text: '%sn',
                  type: 'Word',
                },
                {
                  text: '"$*"',
                  expansion: [
                    {
                      kind: 'positional-string',
                      parameter: '*',
                      loc: {
                        start: 1,
                        end: 2,
                      },
                      type: 'ParameterExpansion',
                    },
                  ],
                  type: 'Word',
                },
              ],
            },
          ],
        },
      },
    ],
  },
};
