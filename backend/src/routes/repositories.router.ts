import { Router } from 'express';
import { z } from 'zod';
import { cloneRepository, listRepositories } from '../controllers/repositories.controller';
import { validateBody } from '../middleware/validate.middleware';

export const repositoriesRouter = Router();

const CloneBodySchema = z.object({
  url: z.string().url('Must be a valid URL'),
});

/**
 * @openapi
 * /api/repositories/clone:
 *   post:
 *     summary: Clone a GitHub repository
 *     description: Clones the given public GitHub repository to local storage. If already cloned, pulls latest changes.
 *     tags: [Repositories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CloneRequest'
 *     responses:
 *       200:
 *         description: Repository cloned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RepoInfo'
 *       400:
 *         description: Invalid URL or unsupported host
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Clone failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
repositoriesRouter.post('/clone', validateBody(CloneBodySchema), cloneRepository);

/**
 * @openapi
 * /api/repositories:
 *   get:
 *     summary: List all locally cloned repositories
 *     tags: [Repositories]
 *     responses:
 *       200:
 *         description: List of cloned repositories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 repositories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RepoInfo'
 */
repositoriesRouter.get('/', listRepositories);
