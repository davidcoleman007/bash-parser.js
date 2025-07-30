import { TransformRunner, TransformFunction } from '../runner';
import { FileInfo } from '../file-manager';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

describe('TransformRunner', () => {
  let runner: TransformRunner;
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bashcodeshift-test-'));
    runner = new TransformRunner({ dryRun: true });
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  describe('run()', () => {
    it('should process files and apply transforms', async () => {
      // Create a test file
      const testFile = path.join(tempDir, 'test.sh');
      await fs.writeFile(testFile, 'npm install lodash');

      // Create a simple transform
      const transform: TransformFunction = async (fileInfo: FileInfo, api) => {
        const j = api.b(fileInfo.source);
        const npmCommands = j.findCommands('npm');
        j.forEach(npmCommands, path => {
          path.node.name.text = 'yarn';
        });
        return j.toSource();
      };

      // Run the transform - use the full path to the test file
      const stats = await runner.run(testFile, transform);

      expect(stats.processed).toBe(1);
      expect(stats.changed).toBe(1);
      expect(stats.errors).toBe(0);
      expect(stats.files).toContain(testFile);
    });

    it('should handle files that are not changed', async () => {
      // Create a test file
      const testFile = path.join(tempDir, 'test.sh');
      await fs.writeFile(testFile, 'echo "hello"');

      // Create a transform that doesn't change anything
      const transform: TransformFunction = async (fileInfo: FileInfo, api) => {
        return fileInfo.source; // Return unchanged source
      };

      // Run the transform - use the full path to the test file
      const stats = await runner.run(testFile, transform);

      expect(stats.processed).toBe(1);
      expect(stats.changed).toBe(0);
      expect(stats.errors).toBe(0);
      expect(stats.files).toHaveLength(0);
    });

    it('should handle transform errors gracefully', async () => {
      // Create a test file
      const testFile = path.join(tempDir, 'test.sh');
      await fs.writeFile(testFile, 'npm install lodash');

      // Create a transform that throws an error
      const transform: TransformFunction = async () => {
        throw new Error('Transform error');
      };

      // Run the transform - use the full path to the test file
      const stats = await runner.run(testFile, transform);

      expect(stats.processed).toBe(1);
      expect(stats.changed).toBe(0);
      expect(stats.errors).toBe(1);
      expect(stats.files).toHaveLength(0);
    });

    it('should filter out non-bash files', async () => {
      // Create a bash file and a non-bash file
      const bashFile = path.join(tempDir, 'script.sh');
      const textFile = path.join(tempDir, 'readme.txt');

      await fs.writeFile(bashFile, 'npm install lodash');
      await fs.writeFile(textFile, 'This is not a bash script');

      // Create a simple transform
      const transform: TransformFunction = async (fileInfo: FileInfo, api) => {
        const j = api.b(fileInfo.source);
        const npmCommands = j.findCommands('npm');
        j.forEach(npmCommands, path => {
          path.node.name.text = 'yarn';
        });
        return j.toSource();
      };

      // Run the transform - use the full path to the bash file
      const stats = await runner.run(bashFile, transform);

      expect(stats.processed).toBe(1); // Only the bash file
      expect(stats.changed).toBe(1);
      expect(stats.errors).toBe(0);
      expect(stats.files).toContain(bashFile);
      expect(stats.files).not.toContain(textFile);
    });
  });

  describe('getStats()', () => {
    it('should return current statistics', () => {
      const stats = runner.getStats();
      expect(stats.processed).toBe(0);
      expect(stats.changed).toBe(0);
      expect(stats.errors).toBe(0);
    });
  });

  describe('resetStats()', () => {
    it('should reset statistics', async () => {
      // Create a test file and run a transform to generate some stats
      const testFile = path.join(tempDir, 'test.sh');
      await fs.writeFile(testFile, 'npm install lodash');

      const transform: TransformFunction = async (fileInfo: FileInfo, api) => {
        const j = api.b(fileInfo.source);
        const npmCommands = j.findCommands('npm');
        j.forEach(npmCommands, path => {
          path.node.name.text = 'yarn';
        });
        return j.toSource();
      };

      await runner.run(testFile, transform);

      // Check that stats were updated
      let stats = runner.getStats();
      expect(stats.processed).toBe(1);
      expect(stats.changed).toBe(1);

      // Reset stats
      runner.resetStats();
      stats = runner.getStats();
      expect(stats.processed).toBe(0);
      expect(stats.changed).toBe(0);
      expect(stats.errors).toBe(0);
    });
  });
});