# CLI Usage

The bashcodeshift command-line interface provides a simple way to run transforms on Bash files.

## Basic Usage

```bash
bashcodeshift -t <transform> <files>
```

## Command Structure

```bash
bashcodeshift run <transform> <files> [options]
```

### Arguments

- `transform` - Path to the transform file (TypeScript/JavaScript)
- `files` - Glob pattern or file path(s) to transform

### Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--dry-run` | `-d` | Show what would be changed without making changes | `false` |
| `--verbose` | `-v` | Show detailed output | `false` |
| `--backup` | `-b` | Create backup files before modifying | `false` |
| `--encoding` | `-e` | File encoding | `utf8` |
| `--help` | `-h` | Show help information | - |

## Examples

### Transform a Single File

```bash
bashcodeshift -t my-transform.ts script.sh
```

### Transform Multiple Files with Glob

```bash
bashcodeshift -t my-transform.ts "**/*.sh"
bashcodeshift -t my-transform.ts "scripts/*.sh"
bashcodeshift -t my-transform.ts "build-*.sh"
```

### Dry Run (Preview Changes)

```bash
bashcodeshift -t my-transform.ts --dry-run script.sh
```

### Verbose Output

```bash
bashcodeshift -t my-transform.ts --verbose script.sh
```

### Create Backups

```bash
bashcodeshift -t my-transform.ts --backup script.sh
# Creates script.sh.backup before modifying
```

### Combine Options

```bash
bashcodeshift -t my-transform.ts --dry-run --verbose "**/*.sh"
```

## Output

### Success Output

```
Found 3 bash files to process
Processing /path/to/script1.sh
✓ Modified /path/to/script1.sh
Processing /path/to/script2.sh
✓ Modified /path/to/script2.sh
Processing /path/to/script3.sh
✓ No changes needed

Transform completed:
- Processed: 3 files
- Modified: 2 files
- Errors: 0
```

### Dry Run Output

```
Found 3 bash files to process
Processing /path/to/script1.sh
[DRY RUN] Would modify /path/to/script1.sh
Processing /path/to/script2.sh
[DRY RUN] Would modify /path/to/script2.sh
Processing /path/to/script3.sh
[DRY RUN] No changes needed for /path/to/script3.sh

Transform completed (dry run):
- Processed: 3 files
- Would modify: 2 files
- Errors: 0
```

### Error Output

```
Found 3 bash files to process
Processing /path/to/script1.sh
✓ Modified /path/to/script1.sh
Processing /path/to/script2.sh
✗ Error processing /path/to/script2.sh: Syntax error at line 5
Processing /path/to/script3.sh
✓ Modified /path/to/script3.sh

Transform completed:
- Processed: 3 files
- Modified: 2 files
- Errors: 1
```

## Exit Codes

- `0` - Success (all files processed)
- `1` - Error (one or more files failed)
- `2` - Usage error (invalid arguments)

## File Discovery

Bashcodeshift automatically:

1. **Expands glob patterns** - `*.sh` becomes all `.sh` files in current directory
2. **Filters Bash files** - Only processes files with `.sh` extension or shebang
3. **Handles relative paths** - Resolves relative to current working directory
4. **Supports multiple patterns** - `"*.sh" "scripts/*.sh"`

### Supported File Types

- Files with `.sh` extension
- Files with shebang (`#!/bin/bash`, `#!/bin/sh`, etc.)
- Files explicitly passed as arguments

### Glob Pattern Examples

```bash
# All shell scripts in current directory
*.sh

# All shell scripts recursively
**/*.sh

# Shell scripts in specific directories
scripts/*.sh
build/*.sh

# Shell scripts with specific prefixes
build-*.sh
deploy-*.sh

# Multiple patterns
"*.sh" "scripts/*.sh" "build/*.sh"
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BASHCODESHIFT_DRY_RUN` | Enable dry run mode | `false` |
| `BASHCODESHIFT_VERBOSE` | Enable verbose output | `false` |
| `BASHCODESHIFT_BACKUP` | Enable backup creation | `false` |

## Integration with Package Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "transform:update-npm": "bashcodeshift -t transforms/update-npm.ts \"**/*.sh\"",
    "transform:add-debug": "bashcodeshift -t transforms/add-debug.ts --dry-run \"**/*.sh\"",
    "transform:backup": "bashcodeshift -t transforms/my-transform.ts --backup \"**/*.sh\""
  }
}
```

Then run:

```bash
npm run transform:update-npm
npm run transform:add-debug
npm run transform:backup
```

## Troubleshooting

### Common Issues

**Transform not found:**
```bash
# ❌ Wrong - relative to current directory
bashcodeshift -t transforms/my-transform.ts script.sh

# ✅ Correct - use absolute path or correct relative path
bashcodeshift -t ./transforms/my-transform.ts script.sh
```

**No files found:**
```bash
# Check if glob pattern is correct
bashcodeshift -t my-transform.ts --verbose "*.sh"
```

**Permission denied:**
```bash
# Make sure you have write permissions
chmod +w script.sh
```

### Debug Mode

For detailed debugging, use verbose mode:

```bash
bashcodeshift -t my-transform.ts --verbose script.sh
```

This will show:
- File discovery process
- AST parsing details
- Transform execution steps
- Code generation information

## Related Documentation

- [Quick Start Guide](./quick-start.md) - Get started quickly
- [Transform API](./transform-api.md) - Writing transforms
- [Testing Transforms](./testing.md) - Testing your transforms