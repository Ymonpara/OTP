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
