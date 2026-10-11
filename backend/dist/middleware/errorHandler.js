"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, _req, res, _next) => {
    console.error('[SERVER ERROR]', err);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal server error',
    });
};
exports.errorHandler = errorHandler;
