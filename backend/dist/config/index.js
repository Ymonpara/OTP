"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'super-secret-otp-jwt-key-2026-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    superadminMasterKey: process.env.SUPERADMIN_MASTER_KEY || 'SUPERADMIN_2026',
    databaseUrl: process.env.DATABASE_URL || '',
    fiveSimApiKey: process.env.FIVESIM_API_KEY || '',
    onlineSimApiKey: process.env.ONLINESIM_API_KEY || '',
    smsManApiKey: process.env.SMSMAN_API_KEY || '',
    // RUB to INR conversion rate for wholesale provider billing calculation
    rubToInrRate: parseFloat(process.env.RUB_TO_INR_RATE || '1.10'),
};
