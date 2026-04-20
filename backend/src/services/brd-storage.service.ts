import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BrdMeta } from '../types';
import { createError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

export class BrdStorageService {
  constructor(private outputRoot: string) {}

  async saveFeatureRequirements(repoId: string, jobId: string, content: string): Promise<string> {
    const dir = path.resolve(this.outputRoot, repoId, jobId);
    await fs.mkdir(dir, { recursive: true });
    const filePath = path.join(dir, 'feature-level-requirements.md');
    await fs.writeFile(filePath, content, 'utf-8');
    logger.log(`[storage] Feature requirements saved: ${filePath}`);
    return filePath;
  }

  async readFeatureRequirements(repoId: string, jobId: string): Promise<string> {
    const filePath = path.resolve(this.outputRoot, repoId, jobId, 'feature-level-requirements.md');
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch {
      throw createError(`Feature requirements for job '${jobId}' not found`, 404);
    }
  }

  async saveBrd(
    repoId: string,
    content: string,
  ): Promise<{ brdId: string; filePath: string; filename: string }> {
    const brdId = uuidv4();
    const date = new Date().toISOString().slice(0, 10);
    const filename = `${repoId}-BRD-${date}.md`;
    const dir = path.resolve(this.outputRoot, repoId, 'brds', brdId);
    await fs.mkdir(dir, { recursive: true });
    const filePath = path.join(dir, filename);
    await fs.writeFile(filePath, content, 'utf-8');
    logger.log(`[storage] BRD saved: ${filePath}`);
    return { brdId, filePath, filename };
  }

  async readBrd(brdId: string): Promise<{ content: string; filename: string; filePath: string }> {
    // Search for brdId directory across all repos
    const entries = await this.findBrdDir(brdId);
    if (!entries) {
      throw createError(`BRD '${brdId}' not found`, 404);
    }
    const content = await fs.readFile(entries.filePath, 'utf-8');
    return { content, filename: entries.filename, filePath: entries.filePath };
  }

  async listBrds(repoId?: string): Promise<BrdMeta[]> {
    await fs.mkdir(this.outputRoot, { recursive: true });
    const results: BrdMeta[] = [];

    const repoDirs = repoId
      ? [repoId]
      : (await fs.readdir(this.outputRoot)).filter(async (d) => {
          const stat = await fs.stat(path.join(this.outputRoot, d));
          return stat.isDirectory();
        });

    for (const rId of repoDirs) {
      const brdsDir = path.join(this.outputRoot, rId, 'brds');
      try {
        const brdIds = await fs.readdir(brdsDir);
        for (const bid of brdIds) {
          const brdDir = path.join(brdsDir, bid);
          const files = await fs.readdir(brdDir);
          const mdFile = files.find((f) => f.endsWith('.md'));
          if (mdFile) {
            const stat = await fs.stat(path.join(brdDir, mdFile));
            results.push({
              brdId: bid,
              repoId: rId,
              filename: mdFile,
              filePath: path.join(brdDir, mdFile),
              generatedAt: stat.birthtime.toISOString(),
            });
          }
        }
      } catch {
        // no brds dir yet
      }
    }

    return results;
  }

  private async findBrdDir(
    brdId: string,
  ): Promise<{ filePath: string; filename: string } | null> {
    await fs.mkdir(this.outputRoot, { recursive: true });
    let repoDirs: string[];
    try {
      repoDirs = await fs.readdir(this.outputRoot);
    } catch {
      return null;
    }

    for (const rId of repoDirs) {
      const brdDir = path.join(this.outputRoot, rId, 'brds', brdId);
      try {
        const files = await fs.readdir(brdDir);
        const mdFile = files.find((f) => f.endsWith('.md'));
        if (mdFile) {
          return { filePath: path.join(brdDir, mdFile), filename: mdFile };
        }
      } catch {
        continue;
      }
    }
    return null;
  }
}
