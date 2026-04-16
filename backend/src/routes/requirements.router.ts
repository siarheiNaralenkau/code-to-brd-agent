import { Router } from 'express';
import { z } from 'zod';
import { extractFeatures } from '../controllers/requirements.controller';
import { validateBody } from '../middleware/validate.middleware';

export const requirementsRouter = Router();

const FeaturesBodySchema = z.object({
  repoId: z.string().min(1, 'repoId is required'),
  model: z.string().optional(),
});

/**
 * @openapi
 * /api/requirements/features:
 *   post:
 *     summary: Extract feature-level requirements (Phase 1)
 *     description: >
 *       Parses the repository with tree-sitter, then uses an Anthropic LLM to analyze the AST
 *       layer by layer and produce structured feature-level requirements with traceability.
 *       The result is saved to disk and a jobId is returned for use in Phase 2.
 *     tags: [Requirements]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FeaturesRequest'
 *     responses:
 *       200:
 *         description: Feature-level requirements extracted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeaturesResponse'
 *       400:
 *         description: No parseable source files found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Repository not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: LLM call or parsing failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
requirementsRouter.post('/features', validateBody(FeaturesBodySchema), extractFeatures);
