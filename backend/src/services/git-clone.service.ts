import simpleGit from 'simple-git';
import path from 'path';
import fs from 'fs/promises';
import { RepoInfo } from '../types';
import { createError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';

const ALLOWED_HOSTS = ['github.com', 'gitlab.com', 'bitbucket.org'];

export class GitCloneService {
  constructor(private reposRoot: string) {}

  async clone(url: string): Promise<RepoInfo & { clonedAt: string }> {
    this.validateUrl(url);

    const { repoId, name } = this.parseUrl(url);
    const repoPath = path.resolve(this.reposRoot, repoId);

    await fs.mkdir(this.reposRoot, { recursive: true });

    const alreadyExists = await this.hasGitDir(repoPath);

    if (alreadyExists) {
      logger.log(`[git] Repo ${repoId} exists — pulling latest`);
      await simpleGit(repoPath).pull();
    } else {
      logger.log(`[git] Cloning ${url} -> ${repoPath}`);
      await simpleGit().clone(url, repoPath, ['--depth', '1']);
    }

    return {
      repoId,
      name,
      repoPath,
      clonedAt: new Date().toISOString(),
    };
  }

  async list(): Promise<RepoInfo[]> {
    await fs.mkdir(this.reposRoot, { recursive: true });
    const entries = await fs.readdir(this.reposRoot, { withFileTypes: true });

    const results: RepoInfo[] = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const repoPath = path.join(this.reposRoot, entry.name);
      if (await this.hasGitDir(repoPath)) {
        results.push({
          repoId: entry.name,
          name: entry.name.replace('-', '/'),
          repoPath,
        });
      }
    }
    return results;
  }

  private validateUrl(url: string): void {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw createError('Invalid URL format', 400);
    }

    if (parsed.protocol !== 'https:') {
      throw createError('Only HTTPS URLs are allowed', 400);
    }

    if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
      throw createError(
        `Host not allowed. Allowed hosts: ${ALLOWED_HOSTS.join(', ')}`,
        400,
      );
    }
  }

  private parseUrl(url: string): { repoId: string; name: string } {
    const parsed = new URL(url);
    // pathname: /owner/repo or /owner/repo.git
    const parts = parsed.pathname.replace(/^\//, '').replace(/\.git$/, '').split('/');
    if (parts.length < 2) {
      throw createError('URL must point to a repository (owner/repo)', 400);
    }
    const owner = parts[0].toLowerCase();
    const repo = parts[1].toLowerCase();
    const repoId = `${owner}-${repo}`.replace(/[^a-z0-9-]/g, '-');
    const name = `${parts[0]}/${parts[1]}`;
    return { repoId, name };
  }

  private async hasGitDir(dirPath: string): Promise<boolean> {
    try {
      await fs.access(path.join(dirPath, '.git'));
      return true;
    } catch {
      return false;
    }
  }
}
