import bashParser from '~/parse.ts';
import utils from './_utils.ts';

Deno.test('special parameter', async (t) => {
  await t.step('positional list parameter', () => {
    const result = bashParser('echoword=$@');
    // console.log(JSON.stringify(result, null, 5))
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Command',
        prefix: [{
          type: 'AssignmentWord',
          text: 'echoword=$@',
          expansion: [{
            type: 'ParameterExpansion',
            parameter: '@',
            kind: 'positional-list',
            loc: {
              start: 9,
              end: 10,
            },
          }],
        }],
      }],
    });
  });

  await t.step('positional string parameter', () => {
    const result = bashParser('echoword=$*');
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Command',
        prefix: [{
          type: 'AssignmentWord',
          text: 'echoword=$*',
          expansion: [{
            type: 'ParameterExpansion',
            parameter: '*',
            kind: 'positional-string',
            loc: {
              start: 9,
              end: 10,
            },
          }],
        }],
      }],
    });
  });

  await t.step('positional count parameter', () => {
    const result = bashParser('echoword=$#');
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Command',
        prefix: [{
          type: 'AssignmentWord',
          text: 'echoword=$#',
          expansion: [{
            type: 'ParameterExpansion',
            parameter: '#',
            kind: 'positional-count',
            loc: {
              start: 9,
              end: 10,
            },
          }],
        }],
      }],
    });
  });

  await t.step('last exit status', () => {
    const result = bashParser('echoword=$?');
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Command',
        prefix: [{
          type: 'AssignmentWord',
          text: 'echoword=$?',
          expansion: [{
            type: 'ParameterExpansion',
            parameter: '?',
            kind: 'last-exit-status',
            loc: {
              start: 9,
              end: 10,
            },
          }],
        }],
      }],
    });
  });

  await t.step('current option flags', () => {
    const result = bashParser('echoword=$-');
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Command',
        prefix: [{
          type: 'AssignmentWord',
          text: 'echoword=$-',
          expansion: [{
            type: 'ParameterExpansion',
            parameter: '-',
            kind: 'current-option-flags',
            loc: {
              start: 9,
              end: 10,
            },
          }],
        }],
      }],
    });
  });

  await t.step('shell process id', () => {
    const result = bashParser('echoword=$$');
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Command',
        prefix: [{
          type: 'AssignmentWord',
          text: 'echoword=$$',
          expansion: [{
            type: 'ParameterExpansion',
            parameter: '$',
            kind: 'shell-process-id',
            loc: {
              start: 9,
              end: 10,
            },
          }],
        }],
      }],
    });
  });

  await t.step('last background pid', () => {
    const result = bashParser('echoword=$!');
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Command',
        prefix: [{
          type: 'AssignmentWord',
          text: 'echoword=$!',
          expansion: [{
            type: 'ParameterExpansion',
            parameter: '!',
            kind: 'last-background-pid',
            loc: {
              start: 9,
              end: 10,
            },
          }],
        }],
      }],
    });
  });

  await t.step('shell script name', () => {
    const result = bashParser('echoword=$0');
    // logResults(result);
    utils.checkResults(result, {
      type: 'Script',
      commands: [{
        type: 'Command',
        prefix: [{
          type: 'AssignmentWord',
          text: 'echoword=$0',
          expansion: [{
            type: 'ParameterExpansion',
            parameter: '0',
            kind: 'shell-script-name',
            loc: {
              start: 9,
              end: 10,
            },
          }],
        }],
      }],
    });
  });
});
