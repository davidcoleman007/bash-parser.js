import bashParser from '~/parse.ts';
import utils from './_utils.ts';

describe('tilde-expanding', async (t) => {
  it('resolve tilde to current user home', async () => {
    const result = await bashParser('echo ~/subdir', {
      async resolveHomeUser() {
        return '/home/current';
      },
    });

    utils.checkResults(result, {
      type: 'Script',
      commands: [
        {
          type: 'Command',
          name: { type: 'Word', text: 'echo' },
          suffix: [{
            type: 'Word',
            text: '/home/current/subdir',
          }],
        },
      ],
    });
  });

  it('resolve one tilde only in normal WORD tokens', async () => {
    const result = await bashParser('echo ~/subdir/~other/', {
      async resolveHomeUser() {
        return '/home/current';
      },
    });

    utils.checkResults(result, {
      type: 'Script',
      commands: [
        {
          type: 'Command',
          name: { type: 'Word', text: 'echo' },
          suffix: [{
            type: 'Word',
            text: '/home/current/subdir/~other/',
          }],
        },
      ],
    });
  });

  it('resolve multiple tilde in assignments', async () => {
    const result = await bashParser('a=~/subdir:~/othersubdir/ciao', {
      async resolveHomeUser() {
        return '/home/current';
      },
    });
    // utils.logResults(result.commands[0].prefix[0]);
    utils.checkResults((result as any).commands[0].prefix[0], {
      type: 'AssignmentWord',
      text: 'a=/home/current/subdir:/home/current/othersubdir/ciao',
    });
  });

  it('resolve tilde to any user home', async () => {
    const result = await bashParser('echo ~username/subdir', {
      async resolveHomeUser() {
        return '/home/username';
      },
    });

    utils.checkResults(result, {
      type: 'Script',
      commands: [
        {
          type: 'Command',
          name: { type: 'Word', text: 'echo' },
          suffix: [{
            type: 'Word',
            text: '/home/username/subdir',
          }],
        },
      ],
    });
  });
});
