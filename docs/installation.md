# Installation & Setup

How to install and configure bashcodeshift for your project.

## Prerequisites

- **Node.js**: Version 16 or higher
- **npm** or **yarn**: For package management
- **TypeScript**: For writing transforms (recommended)

## Installation

### Global Installation

Install bashcodeshift globally to use it from anywhere:

```bash
npm install -g bashcodeshift
```

### Local Installation

Install bashcodeshift as a development dependency in your project:

```bash
npm install --save-dev bashcodeshift
```

### From Source

Clone and build from source:

```bash
git clone https://github.com/your-org/bashcodeshift.git
cd bashcodeshift
npm install
npm run build
npm link  # Makes bashcodeshift available globally
```

## Project Setup

### 1. Initialize a Transform Project

Create a new directory for your transforms:

```bash
mkdir my-transforms
cd my-transforms
npm init -y
```

### 2. Install Dependencies

```bash
npm install --save-dev bashcodeshift typescript @types/node
```

### 3. TypeScript Configuration

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 4. Project Structure

```
my-transforms/
├── src/
│   ├── transforms/
│   │   ├── npm-to-yarn.ts
│   │   ├── add-debug.ts
│   │   └── docker-optimize.ts
│   └── utils/
│       └── helpers.ts
├── tests/
│   └── transforms/
│       ├── npm-to-yarn.test.ts
│       ├── add-debug.test.ts
│       └── docker-optimize.test.ts
├── package.json
├── tsconfig.json
└── jest.config.js
```

### 5. Jest Configuration

Create `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
```

### 6. Package Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "transform:example": "bashcodeshift -t src/transforms/npm-to-yarn.ts \"**/*.sh\"",
    "transform:dry-run": "bashcodeshift -t src/transforms/npm-to-yarn.ts --dry-run \"**/*.sh\""
  }
}
```

## Configuration

### Environment Variables

Set environment variables for default behavior:

```bash
# Enable dry run mode by default
export BASHCODESHIFT_DRY_RUN=true

# Enable verbose output
export BASHCODESHIFT_VERBOSE=true

# Enable backup creation
export BASHCODESHIFT_BACKUP=true
```

### Editor Configuration

#### VS Code

Install recommended extensions:

```json
// .vscode/extensions.json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint"
  ]
}
```

#### ESLint Configuration

Create `.eslintrc.js`:

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn'
  }
};
```

#### Prettier Configuration

Create `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

## First Transform

### 1. Create Your First Transform

Create `src/transforms/hello-world.ts`:

```typescript
import { TransformFunction } from 'bashcodeshift';

const transform: TransformFunction = async (fileInfo, api) => {
  const j = api.b(fileInfo.source);

  // Add a hello world comment at the beginning
  const ast = j.getAST();
  const comment = {
    type: 'Comment',
    text: '# Hello from bashcodeshift!'
  };

  const newline = { type: 'Newline' };

  ast.body.unshift(comment, newline);

  return j.toSource();
};

export default transform;
```

### 2. Test Your Transform

Create `tests/transforms/hello-world.test.ts`:

```typescript
import { TransformRunner } from 'bashcodeshift';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import helloWorldTransform from '../../src/transforms/hello-world';

describe('hello-world transform', () => {
  let runner: TransformRunner;
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bashcodeshift-test-'));
    runner = new TransformRunner({ dryRun: false });
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('should add hello world comment', async () => {
    const testFile = path.join(tempDir, 'test.sh');
    const originalContent = 'echo "Hello World"';

    await fs.writeFile(testFile, originalContent);

    const stats = await runner.run(testFile, helloWorldTransform);

    expect(stats.processed).toBe(1);
    expect(stats.changed).toBe(1);

    const content = await fs.readFile(testFile, 'utf8');
    expect(content).toContain('# Hello from bashcodeshift!');
    expect(content).toContain('echo "Hello World"');
  });
});
```

### 3. Run Your Transform

```bash
# Build the project
npm run build

# Run tests
npm test

# Run transform on a test file
npm run transform:example

# Dry run to preview changes
npm run transform:dry-run
```

## Troubleshooting

### Common Issues

#### Transform Not Found

```bash
# ❌ Wrong - relative path issues
bashcodeshift -t transforms/my-transform.ts script.sh

# ✅ Correct - use absolute path or correct relative path
bashcodeshift -t ./transforms/my-transform.ts script.sh
bashcodeshift -t $(pwd)/transforms/my-transform.ts script.sh
```

#### TypeScript Compilation Errors

```bash
# Build before running
npm run build

# Or run TypeScript directly
npx ts-node src/transforms/my-transform.ts
```

#### Permission Issues

```bash
# Make sure you have write permissions
chmod +w script.sh

# Or run with sudo (not recommended)
sudo bashcodeshift -t my-transform.ts script.sh
```

#### No Files Found

```bash
# Check if glob pattern is correct
bashcodeshift -t my-transform.ts --verbose "*.sh"

# Check if files exist
ls -la *.sh
```

### Getting Help

- Check the [CLI Usage](./cli-usage.md) documentation
- Review [Common Patterns](./common-patterns.md) for examples
- See [Space and Newline Tokens](./tokens.md) for critical formatting information
- Check the [bash-traverse documentation](https://git.corp.adobe.com/dcoleman/bash-traverse) for AST details

## Next Steps

- [Quick Start Guide](./quick-start.md) - Write your first transform
- [Transform API](./transform-api.md) - Learn the full API
- [Common Patterns](./common-patterns.md) - Reusable transform patterns
- [Examples](./examples.md) - Complete working examples