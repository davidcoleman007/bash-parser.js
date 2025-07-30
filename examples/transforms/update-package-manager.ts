/**
 * Transform: Update Package Manager Commands
 *
 * This transform updates package manager commands from npm to yarn.
 * It handles common npm commands and converts them to their yarn equivalents.
 */

import { TransformFunction } from '../../src/core/runner';

const transform: TransformFunction = async (fileInfo, api, options) => {
  const j = api.b(fileInfo.source);

  // Find all npm commands
  const npmCommands = j.findCommands('npm');

  // Transform each npm command
  j.forEach(npmCommands, path => {
    const command = path.node;

    // Filter out spaces and get actual arguments
    const args = command.arguments
      .filter((arg: any) => arg.text !== ' ')
      .map((arg: any) => arg.text);

    if (args.length > 0) {
      const firstArg = args[0];
      switch (firstArg) {
        case 'install':
          command.name.text = 'yarn';
          // Remove the 'install' argument
          command.arguments = command.arguments.filter((arg: any) => arg.text !== 'install');
          break;
        case 'uninstall':
          command.name.text = 'yarn';
          // Replace 'uninstall' with 'remove'
          command.arguments = command.arguments.map((arg: any) =>
            arg.text === 'uninstall' ? { type: 'Word', text: 'remove' } : arg
          );
          break;
        case 'run':
        case 'start':
        case 'test':
        case 'build':
          command.name.text = 'yarn';
          break;
        default:
          command.name.text = 'yarn';
      }
    } else {
      command.name.text = 'yarn';
    }
  });

  return j.toSource();
};

export default transform;