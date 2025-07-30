/**
 * Transform: Add Docker RM Commands
 *
 * This transform adds 'docker rm' commands after 'docker run' commands
 * to clean up containers after they exit.
 */

import { TransformFunction } from '../../src/core/runner';

const transform: TransformFunction = async (fileInfo, api, options) => {
  const j = api.b(fileInfo.source);

  // Find all docker run commands
  const dockerRunCommands = j.findCommands('docker');

  // Add docker rm after each docker run
  j.forEach(dockerRunCommands, path => {
    const command = path.node;
    const args = command.arguments
      .filter((arg: any) => arg.text !== ' ')
      .map((arg: any) => arg.text);

    if (args.length > 0 && args[0] === 'run') {
      // This is a docker run command, add docker rm after it
      const dockerRmCommand = j.Command({
        name: 'docker',
        arguments: ['rm', '$(docker ps -aq)']
      });

      // Insert the docker rm command after this command
      // Note: This is a simplified approach - in a real implementation
      // you'd need to handle the AST insertion more carefully
    }
  });

  return j.toSource();
};

export default transform;