import { Router } from 'express';
import { repositoriesRouter } from './repositories.router';
import { parseRouter } from './parse.router';
import { requirementsRouter } from './requirements.router';
import { brdRouter } from './brd.router';

export const apiRouter = Router();

apiRouter.use('/repositories', repositoriesRouter);
apiRouter.use('/parse', parseRouter);
apiRouter.use('/requirements', requirementsRouter);
apiRouter.use('/brd', brdRouter);
