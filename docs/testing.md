# Testing Transforms

Learn how to test your bashcodeshift transforms to ensure they work correctly.

## Basic Testing Structure

```typescript
import { TransformRunner } from 'bashcodeshift';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

// Import your transform
import myTransform from '../my-transform';

describe('my-transform', () => {
  let runner: TransformRunner;
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bashcodeshift-test-'));
    runner = new TransformRunner({ dryRun: false });
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('should transform npm commands to yarn', async () => {
    // Test implementation
  });
});
```

## Writing Test Cases

### Simple Command Replacement

```typescript
it('should replace npm install with yarn add', async () => {
  const testFile = path.join(tempDir, 'test.sh');
  const originalContent = 'npm install lodash';

  await fs.writeFile(testFile, originalContent);

  const stats = await runner.run(testFile, myTransform);

  expect(stats.processed).toBe(1);
  expect(stats.changed).toBe(1);
  expect(stats.errors).toBe(0);

  const content = await fs.readFile(testFile, 'utf8');
  expect(content).toContain('yarn add lodash');
  expect(content).not.toContain('npm install lodash');
});
```

### Testing Multiple Commands

```typescript
it('should handle multiple npm commands', async () => {
  const testFile = path.join(tempDir, 'test.sh');
  const originalContent = `npm install lodash
npm run build
npm test`;

  await fs.writeFile(testFile, originalContent);

  const stats = await runner.run(testFile, myTransform);

  expect(stats.processed).toBe(1);
  expect(stats.changed).toBe(1);

  const content = await fs.readFile(testFile, 'utf8');
  expect(content).toContain('yarn add lodash');
  expect(content).toContain('yarn build');
  expect(content).toContain('yarn test');
});
```

### Testing Conditional Logic

```typescript
it('should only transform npm install commands', async () => {
  const testFile = path.join(tempDir, 'test.sh');
  const originalContent = `npm install lodash
npm run build
echo "Hello World"`;

  await fs.writeFile(testFile, originalContent);

  const stats = await runner.run(testFile, myTransform);

  const content = await fs.readFile(testFile, 'utf8');
  expect(content).toContain('yarn add lodash');  // Should be transformed
  expect(content).toContain('npm run build');    // Should remain unchanged
  expect(content).toContain('echo "Hello World"'); // Should remain unchanged
});
```

### Testing File Position

```typescript
it('should insert command in correct position', async () => {
  const testFile = path.join(tempDir, 'test.sh');
  const originalContent = `npm install lodash

# SonarQube analysis
if [ -n "$SONAR_TOKEN" ]; then
    npm run test:sonar
fi`;

  await fs.writeFile(testFile, originalContent);

  const stats = await runner.run(testFile, myTransform);

  const content = await fs.readFile(testFile, 'utf8');
  const lines = content.split('\n');

  // Find the positions
  const yarnIndex = lines.findIndex(line => line.includes('yarn add lodash'));
  const sonarIndex = lines.findIndex(line => line.includes('# SonarQube analysis'));

  expect(yarnIndex).toBeGreaterThan(-1);
  expect(sonarIndex).toBeGreaterThan(-1);
  expect(yarnIndex).toBeLessThan(sonarIndex); // yarn command should be before sonar section
});
```

### Testing Edge Cases

```typescript
it('should handle files without npm commands', async () => {
  const testFile = path.join(tempDir, 'test.sh');
  const originalContent = `echo "Hello World"
yarn install lodash`;

  await fs.writeFile(testFile, originalContent);

  const stats = await runner.run(testFile, myTransform);

  expect(stats.processed).toBe(1);
  expect(stats.changed).toBe(0); // No changes needed

  const content = await fs.readFile(testFile, 'utf8');
  expect(content).toBe(originalContent); // Content should be unchanged
});

it('should handle empty files', async () => {
  const testFile = path.join(tempDir, 'test.sh');
  const originalContent = '';

  await fs.writeFile(testFile, originalContent);

  const stats = await runner.run(testFile, myTransform);

  expect(stats.processed).toBe(1);
  expect(stats.changed).toBe(0);

  const content = await fs.readFile(testFile, 'utf8');
  expect(content).toBe('');
});
```

### Testing Error Conditions

```typescript
it('should handle syntax errors gracefully', async () => {
  const testFile = path.join(tempDir, 'test.sh');
  const originalContent = `npm install lodash
if [ -n "$SONAR_TOKEN"  # Missing closing bracket
    npm run test:sonar
fi`;

  await fs.writeFile(testFile, originalContent);

  const stats = await runner.run(testFile, myTransform);

  expect(stats.processed).toBe(1);
  expect(stats.errors).toBe(1); // Should have an error

  // File should remain unchanged due to syntax error
  const content = await fs.readFile(testFile, 'utf8');
  expect(content).toBe(originalContent);
});
```

## Advanced Testing Patterns

### Testing with Multiple Files

```typescript
it('should transform multiple files', async () => {
  const file1 = path.join(tempDir, 'script1.sh');
  const file2 = path.join(tempDir, 'script2.sh');

  await fs.writeFile(file1, 'npm install lodash');
  await fs.writeFile(file2, 'npm run build');

  const stats = await runner.run(path.join(tempDir, '*.sh'), myTransform);

  expect(stats.processed).toBe(2);
  expect(stats.changed).toBe(2);

  const content1 = await fs.readFile(file1, 'utf8');
  const content2 = await fs.readFile(file2, 'utf8');

  expect(content1).toContain('yarn add lodash');
  expect(content2).toContain('yarn build');
});
```

### Testing Dry Run Mode

```typescript
it('should work in dry run mode', async () => {
  const testFile = path.join(tempDir, 'test.sh');
  const originalContent = 'npm install lodash';

  await fs.writeFile(testFile, originalContent);

  const dryRunRunner = new TransformRunner({ dryRun: true });
  const stats = await dryRunRunner.run(testFile, myTransform);

  expect(stats.processed).toBe(1);
  expect(stats.changed).toBe(1);

  // File should remain unchanged in dry run mode
  const content = await fs.readFile(testFile, 'utf8');
  expect(content).toBe(originalContent);
});
```

### Testing with Complex Bash Scripts

```typescript
it('should handle complex bash scripts', async () => {
  const testFile = path.join(tempDir, 'complex.sh');
  const originalContent = `#!/bin/bash

# Build script
set -e

npm install lodash
npm install express

if [ "$NODE_ENV" = "production" ]; then
    npm run build
else
    npm run dev
fi

# Test
npm test`;

  await fs.writeFile(testFile, originalContent);

  const stats = await runner.run(testFile, myTransform);

  const content = await fs.readFile(testFile, 'utf8');

  // Check that install commands were transformed
  expect(content).toContain('yarn add lodash');
  expect(content).toContain('yarn add express');

  // Check that other commands remain unchanged
  expect(content).toContain('npm run build');
  expect(content).toContain('npm run dev');
  expect(content).toContain('npm test');

  // Check that structure is preserved
  expect(content).toContain('#!/bin/bash');
  expect(content).toContain('# Build script');
  expect(content).toContain('set -e');
});
```

## Testing Utilities

### Helper Functions

```typescript
// Helper to create test files
async function createTestFile(filename: string, content: string): Promise<string> {
  const filePath = path.join(tempDir, filename);
  await fs.writeFile(filePath, content);
  return filePath;
}

// Helper to read test file
async function readTestFile(filePath: string): Promise<string> {
  return await fs.readFile(filePath, 'utf8');
}

// Helper to run transform and get results
async function runTransform(transform: any, content: string): Promise<{ stats: any, result: string }> {
  const testFile = await createTestFile('test.sh', content);
  const stats = await runner.run(testFile, transform);
  const result = await readTestFile(testFile);
  return { stats, result };
}
```

### Snapshot Testing

```typescript
it('should match snapshot', async () => {
  const originalContent = 'npm install lodash express';

  const { result } = await runTransform(myTransform, originalContent);

  expect(result).toMatchSnapshot();
});
```

## Running Tests

### Jest Configuration

Add to your `jest.config.js`:

```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- my-transform.test.ts

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

## Best Practices

### Test Organization

1. **Group related tests** using `describe` blocks
2. **Use descriptive test names** that explain the expected behavior
3. **Test both positive and negative cases**
4. **Test edge cases** and error conditions
5. **Keep tests isolated** - each test should be independent

### Test Data

1. **Use realistic test data** that matches your actual use cases
2. **Test with various file sizes** and complexity levels
3. **Include comments and whitespace** in test files
4. **Test with different Bash constructs** (if statements, loops, functions)

### Assertions

1. **Test the output content** - verify the transformed code is correct
2. **Test file positions** - ensure commands are inserted in the right place
3. **Test statistics** - verify the correct number of files were processed
4. **Test error handling** - ensure errors are handled gracefully

## Related Documentation

- [Transform API](./transform-api.md) - Understanding the transform API
- [Common Patterns](./common-patterns.md) - Reusable transform patterns
- [Error Handling](./error-handling.md) - Best practices for error handling
- [Examples](./examples.md) - Complete working examples