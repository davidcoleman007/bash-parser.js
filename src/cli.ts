#!/usr/bin/env node

import { Command } from 'commander';
import { TransformRunner } from './core/runner';
import * as path from 'path';

const program = new Command();

program
  .name('bashcodeshift')
  .description('A jscodeshift-like toolkit for bash script transformations')
  .version('0.1.0');

program
  .command('run')
  .description('Run a transform on bash files')
  .argument('<transform>', 'Path to the transform file')
  .argument('<files>', 'Glob pattern for files to transform')
  .option('-d, --dry-run', 'Show what would be changed without making changes')
  .option('-v, --verbose', 'Show detailed output')
  .option('--no-backup', 'Skip creating backup files')
  .option('--backup-extension <ext>', 'Backup file extension', '.bak')
  .option('--transform-options <json>', 'Options to pass to the transform')
  .action(async (transformPath: string, filesPattern: string, options: any) => {
    try {
      // Load the transform
      const transformModule = require(path.resolve(transformPath));
      const transform = transformModule.default || transformModule;

      if (typeof transform !== 'function') {
        throw new Error('Transform must export a default function');
      }

      // Parse transform options
      let transformOptions = {};
      if (options.transformOptions) {
        try {
          transformOptions = JSON.parse(options.transformOptions);
        } catch (error) {
          throw new Error('Invalid transform options JSON');
        }
      }

      // Create runner
      const runner = new TransformRunner({
        dryRun: options.dryRun,
        verbose: options.verbose,
        backup: options.backup,
        backupExtension: options.backupExtension,
        transformOptions
      });

      // Run the transform
      console.log(`Running transform: ${transformPath}`);
      console.log(`Files: ${filesPattern}`);

      const stats = await runner.run(filesPattern, transform);

      // Report results
      console.log('\nTransform completed:');
      console.log(`  Files processed: ${stats.processed}`);
      console.log(`  Files changed: ${stats.changed}`);
      console.log(`  Errors: ${stats.errors}`);

      if (stats.files.length > 0) {
        console.log('\nModified files:');
        stats.files.forEach(file => console.log(`  ${file}`));
      }

      if (stats.errors > 0) {
        process.exit(1);
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  });

program.parse();