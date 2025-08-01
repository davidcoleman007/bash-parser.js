/**
 * Simple Transform: Add Rollup Commands After npm run build
 *
 * This transform uses the new insertCommandsAfter helper method
 * to demonstrate the cleanest way to insert commands with proper newlines.
 */

import { TransformFunction } from '../../src/core/runner';

const COMMANDS_TO_ADD = [
  'npx rollup-uitests --batchSize=10 --debug',
  'npx rollup-pageobjects',
  'npx map-io-usages',
  'npx map-source-usages'
];

const transform: TransformFunction = async (fileInfo, api) => {
  const j = api.b(fileInfo.source);

  // Remove existing rollup commands
  const rollupPageobjects = j.findCommands('rollup-pageobjects');
  const rollupUitests = j.findCommands('rollup-uitests');

  rollupPageobjects.forEach(path => {
    path.remove();
  });

  rollupUitests.forEach(path => {
    path.remove();
  });

  // Find npm run build commands
  const buildCommands = j.findCommands('npm');
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
  j.insertCommandsAfter(npmRunBuild[0], COMMANDS_TO_ADD);

  return j.toSource();
};

export default transform;