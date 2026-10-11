import { Router, Request, Response } from 'express';
import { memoryStore } from '../store/memoryStore.js';

export const serviceRouter = Router();

serviceRouter.get('/', (_req: Request, res: Response) => {
  const services = Array.from(memoryStore.services.values());
  res.json({
    success: true,
    data: { services },
  });
});

serviceRouter.get('/countries', (_req: Request, res: Response) => {
  const countries = Array.from(memoryStore.countries.values());
  res.json({
    success: true,
    data: { countries },
  });
});

serviceRouter.get('/:id', (req: Request, res: Response) => {
  const service = memoryStore.services.get(req.params.id as string);
  if (!service) {
    res.status(404).json({
      success: false,
      error: 'Service not found',
    });
    return;
  }
  res.json({
    success: true,
    data: { service },
  });
});
