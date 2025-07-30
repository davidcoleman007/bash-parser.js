/**
 * Transform: Complex Multi-Purpose Transform
 *
 * This transform demonstrates various bash script transformations:
 * - Convert npm to yarn
 * - Add error handling to functions
 * - Update git commands
 * - Add logging to echo commands
 * - Convert loops to more efficient forms
 * - Add default values to variables
 * - Add error handling to conditionals
 */

import { TransformFunction } from '../../src/core/runner';

const transform: TransformFunction = async (fileInfo, api, options) => {
  const j = api.b(fileInfo.source);

  // 1. Convert npm commands to yarn
  const npmCommands = j.findCommands('npm');
  j.forEach(npmCommands, path => {
    const command = path.node;
    command.name.text = 'yarn';

    // Remove 'install' argument for yarn
    const args = command.arguments
      .filter((arg: any) => arg.text !== ' ')
      .map((arg: any) => arg.text);

    if (args.length > 0 && args[0] === 'install') {
      command.arguments = command.arguments.filter((arg: any) => arg.text !== 'install');
    }
  });

  // 2. Add error handling to function definitions
  const functions = j.find('FunctionDefinition');
  j.forEach(functions, path => {
    const func = path.node;
    if (func.body && Array.isArray(func.body)) {
      // Add set -e at the beginning of function body
      const setECommand = j.Command({
        name: 'set',
        arguments: ['-e']
      });
      func.body.unshift(setECommand);
    }
  });

  // 3. Update git commands
  const gitCommands = j.findCommands('git');
  j.forEach(gitCommands, path => {
    const command = path.node;
    const args = command.arguments
      .filter((arg: any) => arg.text !== ' ')
      .map((arg: any) => arg.text);

    if (args.length > 0) {
      const firstArg = args[0];
      switch (firstArg) {
        case 'checkout':
          // Add -b flag for new branches
          if (args.length > 1 && !args.includes('-b')) {
            command.arguments.push({ type: 'Word', text: '-b' });
          }
          break;
        case 'push':
          // Add --set-upstream for new branches
          if (args.length > 1 && !args.includes('--set-upstream')) {
            command.arguments.push({ type: 'Word', text: '--set-upstream' });
          }
          break;
      }
    }
  });

  // 4. Add logging to echo commands
  const echoCommands = j.findCommands('echo');
  j.forEach(echoCommands, path => {
    const command = path.node;
    const args = command.arguments
      .filter((arg: any) => arg.text !== ' ')
      .map((arg: any) => arg.text);

    // Add timestamp prefix to echo commands
    if (args.length > 0) {
      const timestampArg = { type: 'Word', text: '"[$(date)]"' };
      command.arguments.unshift(timestampArg);
    }
  });

  // 5. Convert for loops to while loops (simplified example)
  const forLoops = j.find('ForStatement');
  j.forEach(forLoops, path => {
    const forLoop = path.node;
    // This would be a complex transformation in practice
    // For now, just add a comment
    const comment = j.Comment({ value: ' # Converted from for loop' });
    // Note: In a real implementation, you'd need to handle AST insertion
  });

  // 6. Add default values to variable assignments
  const variables = j.find('VariableAssignment');
  j.forEach(variables, path => {
    const variable = path.node;
    const value = variable.value.text;

    // Add default value if variable is empty
    if (value === '' || value === '""' || value === "''") {
      variable.value.text = 'default';
    }
  });

  // 7. Add error handling to if statements
  const ifStatements = j.find('IfStatement');
  j.forEach(ifStatements, path => {
    const ifStmt = path.node;
    // Add error handling comment
    const comment = j.Comment({ value: ' # Added error handling' });
    // Note: In a real implementation, you'd need to handle AST insertion
  });

  return j.toSource();
};

export default transform;