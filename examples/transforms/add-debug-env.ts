/**
 * Transform: Add Debug Environment Variables
 *
 * This transform adds DEBUG=true to all npm commands.
 * Showcases the prefixStatements feature in bash-traverse.
 */

import { TransformFunction } from '../../src/core/runner';

const transform: TransformFunction = async (fileInfo, api, options) => {
  const j = api.b(fileInfo.source);

  // Find all npm commands
  const npmCommands = j.findCommands('npm');

  // Add DEBUG=true to each npm command
  j.forEach(npmCommands, path => {
    const command = path.node;

    // Initialize prefixStatements if it doesn't exist
    if (!command.prefixStatements) {
      command.prefixStatements = [];
    }

    // Check if DEBUG already exists
    const hasDebug = command.prefixStatements.some(
      (prefix: any) => prefix.type === 'VariableAssignment' && prefix.name.text === 'DEBUG'
    );

    if (!hasDebug) {
      command.prefixStatements.push({
        type: 'VariableAssignment',
        name: { type: 'Word', text: 'DEBUG' },
        value: { type: 'Word', text: 'true' }
      });
    }
  });

  return j.toSource();
};

export default transform;