"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const index_js_1 = require("./config/index.js");
const index_js_2 = require("./routes/index.js");
const errorHandler_js_1 = require("./middleware/errorHandler.js");
exports.app = (0, express_1.default)();
// Middlewares
exports.app.use((0, cors_1.default)({
    origin: [index_js_1.config.corsOrigin, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
}));
exports.app.use(express_1.default.json());
exports.app.use((0, morgan_1.default)('dev'));
// Root endpoint
exports.app.get('/', (_req, res) => {
    res.json({
        name: 'OTP Wallet Platform API',
        version: '1.0.0',
        documentation: '/api/v1/health',
        endpoints: {
            auth: '/api/v1/auth',
            wallet: '/api/v1/wallet',
            services: '/api/v1/services',
            otp: '/api/v1/otp',
            tickets: '/api/v1/tickets',
            admin: '/api/v1/admin',
        },
    });
});
// Mount V1 API
exports.app.use('/api/v1', index_js_2.apiRouter);
// 404 Handler
exports.app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: 'API endpoint not found',
    });
});
// Error handling middleware
exports.app.use(errorHandler_js_1.errorHandler);
