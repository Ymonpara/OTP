"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = require("./app.js");
const index_js_1 = require("./config/index.js");
const PORT = index_js_1.config.port;
app_js_1.app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 OTP Wallet Platform Backend running on http://localhost:${PORT}`);
    console.log(`🔧 Environment: ${index_js_1.config.nodeEnv}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/v1/health`);
    console.log(`⚡ API Documentation & Endpoints: http://localhost:${PORT}`);
    console.log(`=================================================`);
});
