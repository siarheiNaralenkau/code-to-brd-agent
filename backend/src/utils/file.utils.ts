import fs from 'fs/promises';
import path from 'path';

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'out',
  'coverage',
  'vendor',
  '.next',
  '.nuxt',
  '__pycache__',
  '.venv',
  'venv',
  'env',
  '.idea',
  '.vscode',
]);

const SKIP_FILE_PATTERNS = [/\.min\.js$/, /\.d\.ts$/, /\.spec\.ts$/, /\.test\.ts$/, /\.spec\.js$/, /\.test\.js$/];

export async function walkFiles(
  dir: string,
  extensions: Set<string>,
): Promise<string[]> {
  const results: string[] = [];
  await walk(dir, extensions, results);
  return results;
}

async function walk(dir: string, extensions: Set<string>, results: string[]): Promise<void> {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      await walk(path.join(dir, entry.name), extensions, results);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (!extensions.has(ext)) continue;
      if (SKIP_FILE_PATTERNS.some((p) => p.test(entry.name))) continue;
      results.push(path.join(dir, entry.name));
    }
  }
}

export async function readFileSafe(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}
