import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { TreeSitterParserService } from '../services/tree-sitter-parser.service';
import { BrdStorageService } from '../services/brd-storage.service';
import { llmService } from '../services/llm.factory';
import { env } from '../config/env';
import { createError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import { BrdRequest } from '../types';

const parserService = new TreeSitterParserService();
const storageService = new BrdStorageService(path.resolve(env.OUTPUT_ROOT));

export async function generateBrd(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { repoId, jobId, model = env.ANTHROPIC_MODEL } = req.body as BrdRequest;
    const repoPath = path.resolve(env.REPOS_ROOT, repoId);

    // Check repo exists
    try {
      await fs.access(repoPath);
    } catch {
      throw createError(`Repository '${repoId}' not found. Clone it first.`, 404);
    }

    // Load feature requirements from storage
    const featureRequirements = await storageService.readFeatureRequirements(repoId, jobId);

    // Parse repo again for AST context
    logger.log(`[brd] Re-parsing ${repoId} for BRD context...`);
    const parseResult = await parserService.parseRepository(repoPath);

    // Generate BRD via LLM
    const brdContent = await llmService.generateBrd(
      featureRequirements,
      parseResult.astSummary,
      model,
    );

    // Save BRD
    const { brdId, filename } = await storageService.saveBrd(repoId, brdContent);

    res.status(200).json({
      brdId,
      repoId,
      filename,
      downloadUrl: `/api/brd/${brdId}/download`,
      previewText: brdContent.slice(0, 2000),
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

export async function downloadBrd(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { brdId } = req.params;
    const { content, filename } = await storageService.readBrd(brdId);

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  } catch (err) {
    next(err);
  }
}

export async function previewBrd(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { brdId } = req.params;
    const { content, filename } = await storageService.readBrd(brdId);
    const PREVIEW_LIMIT = 3000;
    res.status(200).json({
      preview: content.slice(0, PREVIEW_LIMIT),
      truncated: content.length > PREVIEW_LIMIT,
      filename,
    });
  } catch (err) {
    next(err);
  }
}

export async function listBrds(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const repoId = req.query.repoId as string | undefined;
    const brds = await storageService.listBrds(repoId);
    res.status(200).json({ brds });
  } catch (err) {
    next(err);
  }
}
