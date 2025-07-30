import { FileManager, FileInfo, FileManagerOptions } from './file-manager';
import { b, BashCodeshiftAPI } from './api';

export interface TransformAPI {
  b: (source: string) => BashCodeshiftAPI;
  stats: TransformStats;
  report: (message: string) => void;
}

export interface TransformStats {
  processed: number;
  changed: number;
  errors: number;
}

export interface TransformFunction {
  (fileInfo: FileInfo, api: TransformAPI, options: any): string | Promise<string>;
}

export interface RunnerOptions extends FileManagerOptions {
  verbose?: boolean;
  ignorePattern?: string;
  transform?: string;
  transformOptions?: any;
}

export interface RunnerStats {
  processed: number;
  changed: number;
  errors: number;
  files: string[];
}

export class TransformRunner {
  private fileManager: FileManager;
  private options: RunnerOptions;
  private stats: TransformStats;

  constructor(options: RunnerOptions = {}) {
    this.options = options;
    this.fileManager = new FileManager(options);
    this.stats = { processed: 0, changed: 0, errors: 0 };
  }

  /**
   * Run a transform on files matching a pattern or a single file
   */
  async run(pattern: string, transform: TransformFunction): Promise<RunnerStats> {
    let files: string[];

    // Check if it's a single file or a glob pattern
    if (pattern.includes('*') || pattern.includes('?')) {
      files = await this.fileManager.findFiles(pattern);
    } else {
      // Single file
      files = [pattern];
    }

    const bashFiles = files.filter(file => this.fileManager.isBashFile(file));

    console.log(`Found ${bashFiles.length} bash files to process`);

    const results: string[] = [];

    for (const filePath of bashFiles) {
      try {
        const result = await this.processFile(filePath, transform);
        if (result) {
          results.push(filePath);
        }
      } catch (error) {
        this.stats.errors++;
        console.error(`Error processing ${filePath}:`, error);
      }
    }

    return {
      processed: this.stats.processed,
      changed: this.stats.changed,
      errors: this.stats.errors,
      files: results
    };
  }

  /**
   * Process a single file with a transform
   */
  private async processFile(filePath: string, transform: TransformFunction): Promise<boolean> {
    this.stats.processed++;

    // Read the file
    const fileInfo = await this.fileManager.readFile(filePath);

    if (this.options.verbose) {
      console.log(`Processing ${filePath}`);
    }

    // Create the API
    const api: TransformAPI = {
      b,
      stats: this.stats,
      report: (message: string) => {
        if (this.options.verbose) {
          console.log(`[${filePath}] ${message}`);
        }
      }
    };

    // Apply the transform
    const transformedSource = await transform(fileInfo, api, this.options.transformOptions || {});

    // Check if the file was actually changed
    if (transformedSource !== fileInfo.source) {
      this.stats.changed++;

      // Write the transformed content
      await this.fileManager.writeFile(filePath, transformedSource);

      if (this.options.verbose) {
        console.log(`✓ Modified ${filePath}`);
      }

      return true;
    } else {
      if (this.options.verbose) {
        console.log(`- No changes to ${filePath}`);
      }
      return false;
    }
  }

  /**
   * Get current statistics
   */
  getStats(): TransformStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = { processed: 0, changed: 0, errors: 0 };
  }
}