export default {
  sourceCode: 'case foo in * ) echo bar;; esac',
  result: {
    type: 'Script',
    commands: [
      {
        type: 'Case',
        clause: {
          text: 'foo',
          type: 'Word',
        },
        cases: [
          {
            type: 'CaseItem',
            pattern: [
              {
                text: '*',
                type: 'Word',
              },
            ],
            body: {
              type: 'CompoundList',
              commands: [
                {
                  type: 'Command',
                  name: {
                    text: 'echo',
                    type: 'Word',
                  },
                  suffix: [
                    {
                      text: 'bar',
                      type: 'Word',
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
    ],
  },
};
