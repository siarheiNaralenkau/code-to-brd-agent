import { Router } from 'express';
import { z } from 'zod';
import { parseRepository } from '../controllers/parse.controller';
import { validateBody } from '../middleware/validate.middleware';

export const parseRouter = Router();

const ParseBodySchema = z.object({
  repoId: z.string().min(1, 'repoId is required'),
});

/**
 * @openapi
 * /api/parse:
 *   post:
 *     summary: Parse a cloned repository with tree-sitter
 *     description: >
 *       Walks the repository files, parses each supported source file using tree-sitter,
 *       extracts classes, functions, imports and exports, and returns a structured AST summary
 *       grouped by architectural layer.
 *     tags: [Parse]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ParseRequest'
 *     responses:
 *       200:
 *         description: Parse result with AST summary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParseResponse'
 *       404:
 *         description: Repository not found (must clone first)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Parse error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
parseRouter.post('/', validateBody(ParseBodySchema), parseRepository);
