/**
 * Fixed Transform: Add Rollup Commands After npm run build
 *
 * This transform demonstrates the correct way to insert commands with proper newlines
 * after a specific command in a bash script.
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

  // Get the AST to work with statements directly
  const ast = j.getAST();

  // Find the statement containing the first npm run build command
  const firstBuildCommand = npmRunBuild[0];

  // Find the index of the statement containing this command
  let buildCommandStatementIndex = -1;

  for (let i = 0; i < ast.body.length; i++) {
    const statement = ast.body[i];
    if (statement.type === 'Command' && statement === firstBuildCommand.node) {
      buildCommandStatementIndex = i;
      break;
    }
  }

  if (buildCommandStatementIndex === -1) {
    return fileInfo.source; // Couldn't find the statement
  }

  // Create command nodes for each command to add
  const commandsToAdd = COMMANDS_TO_ADD.map(command => {
    const parts = command.split(' ');
    const name = parts[0];
    const args = parts.slice(1);

    // Build arguments array with proper spacing
    const arguments_ = [];
    for (let i = 0; i < args.length; i++) {
      if (i > 0) {
        arguments_.push({ type: 'Space', value: ' ' });
      }
      arguments_.push({ type: 'Word', text: args[i] });
    }

    return {
      type: 'Command',
      name: { type: 'Word', text: name },
      arguments: [
        { type: 'Space', value: ' ' },
        ...arguments_,
      ],
      redirects: [],
    };
  });

  // Insert commands after the build command with proper newlines
  let insertIndex = buildCommandStatementIndex + 1;

  commandsToAdd.forEach((command, index) => {
    // Insert a newline before each command (except the first one)
    if (index > 0) {
      const newline = { type: 'Newline' };
      ast.body.splice(insertIndex, 0, newline as any);
      insertIndex++;
    }

    // Insert the command
    ast.body.splice(insertIndex, 0, command as any);
    insertIndex++;
  });

  // Add a final newline after the last command
  const finalNewline = { type: 'Newline' };
  ast.body.splice(insertIndex, 0, finalNewline as any);

  return j.toSource();
};

export default transform;