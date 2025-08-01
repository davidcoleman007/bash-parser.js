/**
 * Example Transform: Add Rollup Commands After npm run build
 *
 * This transform demonstrates how to use the new insertCommandsAfter method
 * to properly insert commands with newlines after a specific command.
 *
 * This fixes the issue where insertAfter was not adding proper newlines,
 * resulting in concatenated commands like "npm run buildnpx".
 */

const transform = async (fileInfo, api) => {
  const b = api.b(fileInfo.source);

  // Remove existing rollup commands to avoid duplicates
  const rollupPageobjects = b.findCommands('rollup-pageobjects');
  const rollupUitests = b.findCommands('rollup-uitests');

  rollupPageobjects.forEach(path => {
    path.remove();
  });

  rollupUitests.forEach(path => {
    path.remove();
  });

  // Find npm run build commands
  const buildCommands = b.findCommands('npm');
  const npmRunBuild = buildCommands.filter(path => {
    const args = path.node.arguments
      .filter(arg => arg.text !== ' ')
      .map(arg => arg.text);
    return args[0] === 'run' && args[1] === 'build';
  });

  if (npmRunBuild.length === 0) {
    return fileInfo.source; // No build command found
  }

  // Use the new helper method to insert commands with proper newlines
  const COMMANDS_TO_ADD = [
    'npx map-source-usages',
    'npx map-io-usages',
    'npx rollup-pageobjects',
    'npx rollup-uitests --batchSize=10 --debug',
  ];

  b.insertCommandsAfter(npmRunBuild[0], COMMANDS_TO_ADD);

  return b.toSource();
};

module.exports = transform;