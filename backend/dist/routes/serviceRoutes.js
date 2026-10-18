"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceRouter = void 0;
const express_1 = require("express");
const memoryStore_js_1 = require("../store/memoryStore.js");
exports.serviceRouter = (0, express_1.Router)();
exports.serviceRouter.get('/', (_req, res) => {
    const services = Array.from(memoryStore_js_1.memoryStore.services.values());
    res.json({
        success: true,
        data: { services },
    });
});
exports.serviceRouter.get('/countries', (_req, res) => {
    const countries = Array.from(memoryStore_js_1.memoryStore.countries.values());
    res.json({
        success: true,
        data: { countries },
    });
});
exports.serviceRouter.get('/providers', (_req, res) => {
    const providers = Array.from(memoryStore_js_1.memoryStore.providers.values()).sort((a, b) => a.priority - b.priority);
    res.json({
        success: true,
        data: { providers },
    });
});
exports.serviceRouter.post('/providers/:id/sync', async (req, res) => {
    const providerId = req.params.id;
    const provider = memoryStore_js_1.memoryStore.providers.get(providerId);
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
        data: { provider: memoryStore_js_1.memoryStore.providers.get(providerId) },
    });
});
exports.serviceRouter.get('/:id', (req, res) => {
    const service = memoryStore_js_1.memoryStore.services.get(req.params.id);
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
