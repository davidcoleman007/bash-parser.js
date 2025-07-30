/**
 * Transform: Update Git Commands
 *
 * This transform updates git commands to use modern syntax:
 * - git checkout -> git switch
 * - git checkout -b -> git switch -c
 * - git branch -d -> git branch --delete
 */

import { TransformFunction } from '../../src/core/runner';

const transform: TransformFunction = async (fileInfo, api, options) => {
  const j = api.b(fileInfo.source);

  // Find all git commands
  const gitCommands = j.findCommands('git');

  // Transform each git command
  j.forEach(gitCommands, path => {
    const command = path.node;
    const args = command.arguments
      .filter((arg: any) => arg.text !== ' ')
      .map((arg: any) => arg.text);

    if (args.length > 0) {
      const firstArg = args[0];
      switch (firstArg) {
        case 'checkout':
          if (args.length > 1 && args[1] === '-b') {
            // git checkout -b <branch> -> git switch -c <branch>
            command.name.text = 'git';
            command.arguments = command.arguments.map((arg: any) => {
              if (arg.text === 'checkout') return { type: 'Word', text: 'switch' };
              if (arg.text === '-b') return { type: 'Word', text: '-c' };
              return arg;
            });
          } else if (args.length > 1 && !args[1].startsWith('-')) {
            // git checkout <branch> -> git switch <branch>
            command.arguments = command.arguments.map((arg: any) => {
              if (arg.text === 'checkout') return { type: 'Word', text: 'switch' };
              return arg;
            });
          }
          break;
        case 'branch':
          if (args.length > 1 && args[1] === '-d') {
            // git branch -d -> git branch --delete
            command.arguments = command.arguments.map((arg: any) => {
              if (arg.text === '-d') return { type: 'Word', text: '--delete' };
              return arg;
            });
          }
          break;
      }
    }
  });

  return j.toSource();
};

export default transform;