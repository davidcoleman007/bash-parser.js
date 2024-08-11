export default {
  sourceCode: `foo='hello ; rm -rf /'
dest=bar
eval "dest=foo"`,
  result: {
    type: 'Script',
    commands: [{
      type: 'Command',
      prefix: [{ type: 'AssignmentWord', text: 'foo=hello ; rm -rf /' }],
    }, {
      type: 'Command',
      prefix: [{ type: 'AssignmentWord', text: 'dest=bar' }],
    }, {
      type: 'Command',
      name: { type: 'Word', text: 'eval' },
      suffix: [{ type: 'Word', text: 'dest=foo' }],
    }],
  },
};
