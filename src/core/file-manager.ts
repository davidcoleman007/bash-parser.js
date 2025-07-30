import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';

export interface FileInfo {
  path: string;
  source: string;
  name: string;
}

export interface FileManagerOptions {
  dryRun?: boolean;
  backup?: boolean;
  backupExtension?: string;
  encoding?: string;
}

export class FileManager {
  private options: FileManagerOptions;

  constructor(options: FileManagerOptions = {}) {
    this.options = {
      dryRun: false,
      backup: true,
      backupExtension: '.bak',
      encoding: 'utf8',
      ...options
    };
  }

  /**
   * Find files matching a glob pattern
   */
  async findFiles(pattern: string): Promise<string[]> {
    try {
      return await glob(pattern);
    } catch (error) {
      throw new Error(`Failed to find files matching pattern ${pattern}: ${error}`);
    }
  }

  /**
   * Read a file and return its contents
   */
  async readFile(filePath: string): Promise<FileInfo> {
    try {
      const source = await fs.readFile(filePath, this.options.encoding as any);
      return {
        path: filePath,
        source: source.toString(),
        name: path.basename(filePath)
      };
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error}`);
    }
  }

  /**
   * Write content to a file
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    if (this.options.dryRun) {
      console.log(`[DRY RUN] Would write to ${filePath}`);
      return;
    }

    try {
      // Create backup if enabled
      if (this.options.backup) {
        await this.createBackup(filePath);
      }

      // Ensure directory exists
      await fs.ensureDir(path.dirname(filePath));

      // Write the file
      await fs.writeFile(filePath, content, this.options.encoding as any);
    } catch (error) {
      throw new Error(`Failed to write file ${filePath}: ${error}`);
    }
  }

  /**
   * Create a backup of a file
   */
  private async createBackup(filePath: string): Promise<void> {
    if (!await fs.pathExists(filePath)) {
      return; // No file to backup
    }

    const backupPath = `${filePath}${this.options.backupExtension}`;
    try {
      await fs.copy(filePath, backupPath);
    } catch (error) {
      throw new Error(`Failed to create backup ${backupPath}: ${error}`);
    }
  }

  /**
   * Check if a file is a bash script
   */
  isBashFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return ext === '.sh' || ext === '.bash' || ext === '' || ext === '.zsh';
  }

  /**
   * Get file statistics
   */
  async getFileStats(filePath: string): Promise<fs.Stats> {
    return fs.stat(filePath);
  }

  /**
   * Check if a file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    return fs.pathExists(filePath);
  }
}