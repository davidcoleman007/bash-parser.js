import { b, BashCodeshiftAPI } from '../api';

describe('BashCodeshiftAPI', () => {
  let api: BashCodeshiftAPI;

  beforeEach(() => {
    api = b('npm install lodash');
  });

  describe('find()', () => {
    it('should find commands by type', () => {
      const commands = api.find('Command');
      expect(commands).toHaveLength(1);
      expect(commands[0].node.name.text).toBe('npm');
    });

    it('should filter results when filter function is provided', () => {
      const commands = api.find('Command', (node: any) => node.name.text === 'npm');
      expect(commands).toHaveLength(1);
      expect(commands[0].node.name.text).toBe('npm');
    });

    it('should return empty array when no matches found', () => {
      const commands = api.find('Command', (node: any) => node.name.text === 'nonexistent');
      expect(commands).toHaveLength(0);
    });
  });

  describe('findCommands()', () => {
    it('should find commands by name', () => {
      const npmCommands = api.findCommands('npm');
      expect(npmCommands).toHaveLength(1);
      expect(npmCommands[0].node.name.text).toBe('npm');
    });

    it('should return empty array when command not found', () => {
      const yarnCommands = api.findCommands('yarn');
      expect(yarnCommands).toHaveLength(0);
    });
  });

  describe('findVariables()', () => {
    it('should find variable assignments', () => {
      const varApi = b('NAME="John"');
      const variables = varApi.findVariables('NAME');
      expect(variables).toHaveLength(1);
      expect(variables[0].node.name.text).toBe('NAME');
    });
  });

  describe('collection methods', () => {
    it('should filter collections', () => {
      const commands = api.find('Command');
      const filtered = api.filter(commands, path => path.node.name.text === 'npm');
      expect(filtered).toHaveLength(1);
    });

    it('should execute forEach on collections', () => {
      const commands = api.find('Command');
      let count = 0;
      api.forEach(commands, () => count++);
      expect(count).toBe(1);
    });

    it('should map collections', () => {
      const commands = api.find('Command');
      const names = api.map(commands, path => path.node.name.text);
      expect(names).toEqual(['npm']);
    });

    it('should get collection size', () => {
      const commands = api.find('Command');
      expect(api.size(commands)).toBe(1);
    });
  });

  describe('toSource()', () => {
    it('should generate source code', () => {
      const source = api.toSource();
      expect(source).toContain('npm');
      expect(source).toContain('install');
      expect(source).toContain('lodash');
    });

    it('should handle generation options', () => {
      const source = api.toSource({ compact: true });
      expect(source).toContain('npm');
    });
  });

  describe('node constructors', () => {
    it('should create Command nodes', () => {
      const command = api.Command({ name: 'echo', arguments: ['hello'] });
      expect(command.type).toBe('Command');
      expect((command as any).name.text).toBe('echo');
    });

    it('should create VariableAssignment nodes', () => {
      const variable = api.VariableAssignment({ name: 'DEBUG', value: 'true' });
      expect(variable.type).toBe('VariableAssignment');
      expect((variable as any).name.text).toBe('DEBUG');
      expect((variable as any).value.text).toBe('true');
    });

    it('should create FunctionDefinition nodes', () => {
      const func = api.FunctionDefinition({ name: 'test', body: [] });
      expect(func.type).toBe('FunctionDefinition');
      expect((func as any).name.text).toBe('test');
    });
  });

  describe('insertCommandsAfter', () => {
    it('should insert commands with proper newlines after a command', () => {
      const source = `#!/bin/bash
npm run build
echo "Build completed"`;

      const j = new BashCodeshiftAPI(source);

      // Find the npm run build command
      const buildCommands = j.findCommands('npm');
      const npmRunBuild = buildCommands.filter((path: any) => {
        const args = path.node.arguments
          .filter((arg: any) => arg.text !== ' ')
          .map((arg: any) => arg.text);
        return args[0] === 'run' && args[1] === 'build';
      });

      expect(npmRunBuild.length).toBe(1);

      // Insert commands after the build command
      const commandsToAdd = [
        'npx rollup-uitests --batchSize=10 --debug',
        'npx rollup-pageobjects'
      ];

      j.insertCommandsAfter(npmRunBuild[0], commandsToAdd);

      const result = j.toSource();

      // Verify the output has proper newlines
      expect(result).toContain('npm run build\n');
      expect(result).toContain('npx rollup-uitests --batchSize=10 --debug\n');
      expect(result).toContain('npx rollup-pageobjects\n');
      expect(result).toContain('echo "Build completed"');

      // Verify there are no commands without newlines
      expect(result).not.toContain('npm run buildnpx');
    });
  });
});