import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { TreeSitterParserService } from '../services/tree-sitter-parser.service';
import { env } from '../config/env';
import { createError } from '../middleware/error.middleware';

const parserService = new TreeSitterParserService();

export async function parseRepository(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { repoId } = req.body as { repoId: string };
    const repoPath = path.resolve(env.REPOS_ROOT, repoId);

    try {
      await fs.access(repoPath);
    } catch {
      throw createError(`Repository '${repoId}' not found. Clone it first.`, 404);
    }

    console.log(`[parse] Parsing ${repoId}...`);
    const result = await parserService.parseRepository(repoPath);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
