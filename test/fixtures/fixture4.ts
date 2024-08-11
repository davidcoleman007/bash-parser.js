export default {
  sourceCode: 'foo | IFS= read var',
  result: {
    type: 'Script',
    commands: [{
      type: 'Pipeline',
      commands: [{
        type: 'Command',
        name: { type: 'Word', text: 'foo' },
      }, {
        type: 'Command',
        name: { type: 'Word', text: 'read' },
        prefix: [{ type: 'AssignmentWord', text: 'IFS=' }],
        suffix: [{ type: 'Word', text: 'var' }],
      }],
    }],
  },
};
