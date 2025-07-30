/**
 * Transform: Add Rollup PageObjects Command
 *
 * This transform inserts "npx rollup-pageobjects" at the end of the command block
 * that precedes the SonarQube analysis section. It finds the last npm command
 * before the if statement and inserts the new command after it.
 */

import { TransformFunction } from '../../src/core/runner';

const transform: TransformFunction = async (fileInfo, api, options) => {
  const j = api.b(fileInfo.source);

  // Find all commands
  const commands = j.find('Command');

  // Find the if statement that contains SonarQube analysis
  const ifStatements = j.find('IfStatement');

  if (ifStatements.length === 0) {
    // No SonarQube section found, return unchanged
    return j.toSource();
  }

  // Find the last npm command before the SonarQube if statement
  let lastNpmCommandIndex = -1;
  let sonarIfIndex = -1;

  // Get the AST to traverse statements
  const ast = j.getAST();

  // Find the position of the SonarQube if statement
  for (let i = 0; i < ast.body.length; i++) {
    const statement = ast.body[i];
    if (statement.type === 'IfStatement') {
      // Check if this if statement contains SonarQube analysis
      const ifSource = j.toSource({ compact: true });
      if (ifSource.includes('SONAR_TOKEN') || ifSource.includes('SonarQube')) {
        sonarIfIndex = i;
        break;
      }
    }
  }

  if (sonarIfIndex === -1) {
    // No SonarQube section found, return unchanged
    return j.toSource();
  }

  // Find the last npm command before the SonarQube if statement
  for (let i = sonarIfIndex - 1; i >= 0; i--) {
    const statement = ast.body[i];
    if (statement.type === 'Command' && statement.name.text === 'npm') {
      lastNpmCommandIndex = i;
      break;
    }
  }

  if (lastNpmCommandIndex === -1) {
    // No npm commands found before SonarQube section, return unchanged
    return j.toSource();
  }

  // Create the rollup-pageobjects command with proper spacing
  const rollupCommand = {
    type: 'Command',
    name: { type: 'Word', text: 'npx' },
    arguments: [
      { type: 'Space', value: ' ' },
      { type: 'Word', text: 'rollup-pageobjects' }
    ],
    redirects: []
  };

  // Create a newline after the command
  const newline = {
    type: 'Newline'
  };

  // Insert the command and newline after the last npm command
  ast.body.splice(lastNpmCommandIndex + 1, 0, rollupCommand as any, newline as any);

  return j.toSource();
};

export default transform;