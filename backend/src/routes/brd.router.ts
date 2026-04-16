import { Router } from 'express';
import { z } from 'zod';
import { generateBrd, downloadBrd, previewBrd, listBrds } from '../controllers/brd.controller';
import { validateBody } from '../middleware/validate.middleware';

export const brdRouter = Router();

const BrdBodySchema = z.object({
  repoId: z.string().min(1, 'repoId is required'),
  jobId: z.string().min(1, 'jobId is required'),
  model: z.string().optional(),
});

/**
 * @openapi
 * /api/brd:
 *   post:
 *     summary: Generate a Business Requirements Document (Phase 2)
 *     description: >
 *       Takes the feature-level requirements from a previous Phase 1 job and uses an Anthropic LLM
 *       to generate a complete structured BRD in Markdown format. Returns a download URL.
 *     tags: [BRD]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BrdRequest'
 *     responses:
 *       200:
 *         description: BRD generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BrdResponse'
 *       404:
 *         description: Repository or feature requirements not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: LLM call failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
brdRouter.post('/', validateBody(BrdBodySchema), generateBrd);

/**
 * @openapi
 * /api/brd/{brdId}/download:
 *   get:
 *     summary: Download a generated BRD as a Markdown file
 *     tags: [BRD]
 *     parameters:
 *       - in: path
 *         name: brdId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The BRD ID returned from the generate endpoint
 *     responses:
 *       200:
 *         description: BRD Markdown file download
 *         content:
 *           text/markdown:
 *             schema:
 *               type: string
 *       404:
 *         description: BRD not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
brdRouter.get('/:brdId/download', downloadBrd);

/**
 * @openapi
 * /api/brd/{brdId}/preview:
 *   get:
 *     summary: Preview the first 3000 characters of a BRD
 *     tags: [BRD]
 *     parameters:
 *       - in: path
 *         name: brdId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: BRD preview text
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 preview:
 *                   type: string
 *                 truncated:
 *                   type: boolean
 *                 filename:
 *                   type: string
 *       404:
 *         description: BRD not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
brdRouter.get('/:brdId/preview', previewBrd);

/**
 * @openapi
 * /api/brd:
 *   get:
 *     summary: List all generated BRDs
 *     tags: [BRD]
 *     parameters:
 *       - in: query
 *         name: repoId
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by repository ID
 *     responses:
 *       200:
 *         description: List of BRD metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 brds:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       brdId:
 *                         type: string
 *                       repoId:
 *                         type: string
 *                       filename:
 *                         type: string
 *                       generatedAt:
 *                         type: string
 */
brdRouter.get('/', listBrds);
