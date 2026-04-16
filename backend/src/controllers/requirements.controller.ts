import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { TreeSitterParserService } from '../services/tree-sitter-parser.service';
import { LlmService } from '../services/llm.service';
import { BrdStorageService } from '../services/brd-storage.service';
import { env } from '../config/env';
import { createError } from '../middleware/error.middleware';
import { FeaturesRequest } from '../types';

const parserService = new TreeSitterParserService();
const llmService = new LlmService(env.ANTHROPIC_API_KEY);
const storageService = new BrdStorageService(path.resolve(env.OUTPUT_ROOT));

export async function extractFeatures(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { repoId, model = env.ANTHROPIC_MODEL } = req.body as FeaturesRequest;
    const repoPath = path.resolve(env.REPOS_ROOT, repoId);

    try {
      await fs.access(repoPath);
    } catch {
      throw createError(`Repository '${repoId}' not found. Clone it first.`, 404);
    }

    // Parse the repository
    console.log(`[requirements] Parsing ${repoId}...`);
    const parseResult = await parserService.parseRepository(repoPath);

    if (parseResult.fileCount === 0) {
      throw createError('No parseable source files found in repository', 400);
    }

    // Extract feature requirements via LLM
    const rawText = await llmService.extractFeatureRequirements(parseResult.astSummary, model);

    // Save to storage
    const jobId = uuidv4();
    await storageService.saveFeatureRequirements(repoId, jobId, rawText);

    // Parse the LLM output into structured features (best-effort)
    const features = parseFeatureText(rawText);

    res.status(200).json({
      jobId,
      repoId,
      features,
      rawText,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

function parseFeatureText(text: string) {
  const features: Array<{
    featureId: string;
    name: string;
    requirements: string[];
    traceability: Array<{ requirementId: string; classRef: string; layer: string }>;
  }> = [];

  const featureBlocks = text.split(/^## Feature:/m).slice(1);
  let featureIndex = 0;

  for (const block of featureBlocks) {
    const lines = block.split('\n');
    const name = lines[0].trim();
    const featureId = `F-${String(featureIndex + 1).padStart(3, '0')}`;

    const requirements: string[] = [];
    const traceability: Array<{ requirementId: string; classRef: string; layer: string }> = [];

    let inRequirements = false;
    let layer = 'unknown';

    for (const line of lines) {
      if (line.startsWith('### Layer:')) {
        layer = line.replace('### Layer:', '').trim();
      }
      if (line.startsWith('### Requirements:')) {
        inRequirements = true;
        continue;
      }
      if (line.startsWith('### ') && inRequirements) {
        inRequirements = false;
      }
      if (inRequirements && line.trim().startsWith('- REQ-')) {
        const req = line.trim().replace(/^- /, '');
        requirements.push(req);
        const reqIdMatch = req.match(/^(REQ-[A-Z0-9-]+):/);
        if (reqIdMatch) {
          traceability.push({
            requirementId: reqIdMatch[1],
            classRef: 'See full text',
            layer,
          });
        }
      }
    }

    if (name) {
      features.push({ featureId, name, requirements, traceability });
      featureIndex++;
    }
  }

  return features;
}
