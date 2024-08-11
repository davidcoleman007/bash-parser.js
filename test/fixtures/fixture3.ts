export default {
  sourceCode: 'IFS= read -r var',
  result: {
    type: 'Script',
    commands: [{
      type: 'Command',
      name: { type: 'Word', text: 'read' },
      prefix: [{ type: 'AssignmentWord', text: 'IFS=' }],
      suffix: [{ type: 'Word', text: '-r' }, { type: 'Word', text: 'var' }],
    }],
  },
};
