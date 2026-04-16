import { Request, Response, NextFunction } from 'express';
import { GitCloneService } from '../services/git-clone.service';
import { env } from '../config/env';
import path from 'path';

const cloneService = new GitCloneService(path.resolve(env.REPOS_ROOT));

export async function cloneRepository(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { url } = req.body as { url: string };
    const result = await cloneService.clone(url);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function listRepositories(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const repos = await cloneService.list();
    res.status(200).json({ repositories: repos });
  } catch (err) {
    next(err);
  }
}
