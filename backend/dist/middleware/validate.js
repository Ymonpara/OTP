"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema) => {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
                });
                return;
            }
            next(error);
        }
    };
};
exports.validate = validate;
