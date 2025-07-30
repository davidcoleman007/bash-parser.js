import { TransformRunner } from '../../../src/core/runner';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

// Import transform
import addRollupPageobjects from '../add-rollup-pageobjects';

describe('add-rollup-pageobjects transform', () => {
  let runner: TransformRunner;
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bashcodeshift-rollup-'));
    runner = new TransformRunner({ dryRun: false });
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('should insert npx rollup-pageobjects before SonarQube analysis', async () => {
    const testFile = path.join(tempDir, 'test.sh');
    const originalContent = `npm ci
npm run auto-increment-version
npm run update-version
npm run test
npm run build
npm run test:build
npm run build-types
npm run create-type-manifest

# SonarQube analysis
if [ -n "$SONAR_TOKEN" ]; then
    echo "SONAR_TOKEN found. Running SonarQube analysis with SONAR_ANALYSIS_TYPE=$SONAR_ANALYSIS_TYPE"

    if [ -z "$sha" ]; then
        echo "Error: sha is required for SonarQube analysis"
        exit 1
    fi

    npm run test:sonar
fi`;

    await fs.writeFile(testFile, originalContent);

    const stats = await runner.run(testFile, addRollupPageobjects);

    expect(stats.processed).toBe(1);
    expect(stats.changed).toBe(1);
    expect(stats.errors).toBe(0);

    // Check the transformed content
    const content = await fs.readFile(testFile, 'utf8');

    // Should contain the original commands
    expect(content).toContain('npm ci');
    expect(content).toContain('npm run auto-increment-version');
    expect(content).toContain('npm run update-version');
    expect(content).toContain('npm run test');
    expect(content).toContain('npm run build');
    expect(content).toContain('npm run test:build');
    expect(content).toContain('npm run build-types');
    expect(content).toContain('npm run create-type-manifest');

    // Should contain the new rollup command
    expect(content).toContain('npx rollup-pageobjects');

    // Should contain the SonarQube section
    expect(content).toContain('# SonarQube analysis');
    expect(content).toContain('if [ -n "$SONAR_TOKEN" ]');
    expect(content).toContain('npm run test:sonar');

    // The rollup command should be after the last npm command but before the SonarQube section
    const lines = content.split('\n');
    const rollupIndex = lines.findIndex(line => line.includes('npx rollup-pageobjects'));
    const sonarIndex = lines.findIndex(line => line.includes('# SonarQube analysis'));

    expect(rollupIndex).toBeGreaterThan(-1);
    expect(sonarIndex).toBeGreaterThan(-1);
    expect(rollupIndex).toBeLessThan(sonarIndex);

    // The rollup command should be after the last npm command
    // Look for the line that contains both the last npm command and the rollup command
    const lastNpmIndex = lines.findIndex(line => line.includes('npm run create-type-manifest') && line.includes('npx rollup-pageobjects'));
    expect(lastNpmIndex).toBeGreaterThan(-1);
  });

  it('should not modify files without SonarQube analysis', async () => {
    const testFile = path.join(tempDir, 'test.sh');
    const originalContent = `npm ci
npm run build
npm run test

echo "No SonarQube here"`;

    await fs.writeFile(testFile, originalContent);

    const stats = await runner.run(testFile, addRollupPageobjects);

    expect(stats.processed).toBe(1);
    expect(stats.changed).toBe(0); // No change because no SonarQube section
    expect(stats.errors).toBe(0);

    // Check the content remains the same
    const content = await fs.readFile(testFile, 'utf8');
    expect(content).toBe(originalContent);
  });

  it('should handle files with different command structures', async () => {
    const testFile = path.join(tempDir, 'test.sh');
    const originalContent = `yarn install
yarn build
npm run test
npm run lint

# SonarQube analysis
if [ -n "$SONAR_TOKEN" ]; then
    npm run test:sonar
fi`;

    await fs.writeFile(testFile, originalContent);

    const stats = await runner.run(testFile, addRollupPageobjects);

    expect(stats.processed).toBe(1);
    expect(stats.changed).toBe(1);
    expect(stats.errors).toBe(0);

    // Check the transformed content
    const content = await fs.readFile(testFile, 'utf8');

    // Should contain the original commands
    expect(content).toContain('yarn install');
    expect(content).toContain('yarn build');
    expect(content).toContain('npm run test');
    expect(content).toContain('npm run lint');

    // Should contain the new rollup command
    expect(content).toContain('npx rollup-pageobjects');

    // Should contain the SonarQube section
    expect(content).toContain('# SonarQube analysis');

    // The rollup command should be after the last npm command but before the SonarQube section
    const lines = content.split('\n');
    const rollupIndex = lines.findIndex(line => line.includes('npx rollup-pageobjects'));
    const sonarIndex = lines.findIndex(line => line.includes('# SonarQube analysis'));

    expect(rollupIndex).toBeGreaterThan(-1);
    expect(sonarIndex).toBeGreaterThan(-1);
    expect(rollupIndex).toBeLessThan(sonarIndex);
  });
});