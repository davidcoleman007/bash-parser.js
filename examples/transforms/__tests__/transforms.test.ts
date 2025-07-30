import { TransformRunner } from '../../../src/core/runner';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

// Import transforms
import updatePackageManager from '../update-package-manager';
import addDebugEnv from '../add-debug-env';

describe('Example Transforms', () => {
  let runner: TransformRunner;
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bashcodeshift-examples-'));
    runner = new TransformRunner({ dryRun: false });
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  describe('update-package-manager', () => {
    it('should transform npm install to yarn', async () => {
      const testFile = path.join(tempDir, 'test.sh');
      await fs.writeFile(testFile, 'npm install lodash');

      const stats = await runner.run(testFile, updatePackageManager);

      expect(stats.processed).toBe(1);
      expect(stats.changed).toBe(1);
      expect(stats.errors).toBe(0);

      // Check the transformed content
      const content = await fs.readFile(testFile, 'utf8');
      expect(content).toContain('yarn');
      expect(content).toContain('lodash');
      expect(content).not.toContain('npm');
    });

    it('should transform npm uninstall to yarn remove', async () => {
      const testFile = path.join(tempDir, 'test.sh');
      await fs.writeFile(testFile, 'npm uninstall express');

      const stats = await runner.run(testFile, updatePackageManager);

      expect(stats.processed).toBe(1);
      expect(stats.changed).toBe(1);
      expect(stats.errors).toBe(0);

      // Check the transformed content
      const content = await fs.readFile(testFile, 'utf8');
      expect(content).toContain('yarn');
      expect(content).toContain('remove');
      expect(content).toContain('express');
      expect(content).not.toContain('npm');
      expect(content).not.toContain('uninstall');
    });

    it('should transform npm run commands to yarn', async () => {
      const testFile = path.join(tempDir, 'test.sh');
      await fs.writeFile(testFile, 'npm run build');

      const stats = await runner.run(testFile, updatePackageManager);

      expect(stats.processed).toBe(1);
      expect(stats.changed).toBe(1);
      expect(stats.errors).toBe(0);

      // Check the transformed content
      const content = await fs.readFile(testFile, 'utf8');
      expect(content).toContain('yarn');
      expect(content).toContain('run');
      expect(content).toContain('build');
      expect(content).not.toContain('npm');
    });
  });

  describe('add-debug-env', () => {
    it('should add DEBUG=true to npm commands', async () => {
      const testFile = path.join(tempDir, 'test.sh');
      await fs.writeFile(testFile, 'npm run build');

      const stats = await runner.run(testFile, addDebugEnv);

      expect(stats.processed).toBe(1);
      expect(stats.changed).toBe(1);
      expect(stats.errors).toBe(0);

      // Check the transformed content
      const content = await fs.readFile(testFile, 'utf8');
      expect(content).toContain('DEBUG=true');
      expect(content).toContain('npm');
      expect(content).toContain('run');
      expect(content).toContain('build');
    });

    it('should preserve existing environment variables', async () => {
      const testFile = path.join(tempDir, 'test.sh');
      await fs.writeFile(testFile, 'NODE_ENV=production npm run build');

      const stats = await runner.run(testFile, addDebugEnv);

      expect(stats.processed).toBe(1);
      expect(stats.changed).toBe(1);
      expect(stats.errors).toBe(0);

      // Check the transformed content
      const content = await fs.readFile(testFile, 'utf8');
      expect(content).toContain('NODE_ENV=production');
      expect(content).toContain('DEBUG=true');
      expect(content).toContain('npm');
      expect(content).toContain('run');
      expect(content).toContain('build');
    });

    it('should not add DEBUG if it already exists', async () => {
      const testFile = path.join(tempDir, 'test.sh');
      await fs.writeFile(testFile, 'DEBUG=true npm run build');

      const stats = await runner.run(testFile, addDebugEnv);

      expect(stats.processed).toBe(1);
      expect(stats.changed).toBe(0); // No change because DEBUG already exists
      expect(stats.errors).toBe(0);

      // Check the content remains the same
      const content = await fs.readFile(testFile, 'utf8');
      expect(content).toBe('DEBUG=true npm run build');
    });
  });
});