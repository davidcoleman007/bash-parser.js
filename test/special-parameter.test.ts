import bashParser from '~/parse.ts';
import utils from './_utils.ts';

describe('special parameter', async (t) => {
  it('positional list parameter', async () => {
    const result = await bashParser('echoword=$@');
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

  it('positional string parameter', async () => {
    const result = await bashParser('echoword=$*');
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

  it('positional count parameter', async () => {
    const result = await bashParser('echoword=$#');
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

  it('last exit status', async () => {
    const result = await bashParser('echoword=$?');
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

  it('current option flags', async () => {
    const result = await bashParser('echoword=$-');
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

  it('shell process id', async () => {
    const result = await bashParser('echoword=$$');
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

  it('last background pid', async () => {
    const result = await bashParser('echoword=$!');
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

  it('shell script name', async () => {
    const result = await bashParser('echoword=$0');
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
