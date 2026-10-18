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

serviceRouter.get('/providers', (_req: Request, res: Response) => {
  const providers = Array.from(memoryStore.providers.values()).sort((a, b) => a.priority - b.priority);
  res.json({
    success: true,
    data: { providers },
  });
});

serviceRouter.post('/providers/:id/sync', async (req: Request, res: Response) => {
  const providerId = req.params.id as string;
  const provider = memoryStore.providers.get(providerId);
  if (!provider) {
    res.status(404).json({ success: false, error: 'Provider not found' });
    return;
  }

  // Trigger live sync
  const { providerService } = await import('../services/providerService.js');
  await providerService.syncProviderBalances();

  res.json({
    success: true,
    message: `Provider ${provider.name} synced with live carrier API`,
    data: { provider: memoryStore.providers.get(providerId) },
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
