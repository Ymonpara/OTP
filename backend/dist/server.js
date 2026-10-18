"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = require("./app.js");
const index_js_1 = require("./config/index.js");
const otpOrderService_js_1 = require("./services/otpOrderService.js");
const PORT = index_js_1.config.port;
const server = app_js_1.app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 OTP Wallet Platform Backend running on http://localhost:${PORT}`);
    console.log(`🔧 Environment: ${index_js_1.config.nodeEnv}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/v1/health`);
    console.log(`⚡ API Documentation & Endpoints: http://localhost:${PORT}`);
    console.log(`=================================================`);
    // Start background worker for 5-minute order timeout and hold release
    otpOrderService_js_1.otpOrderService.startBackgroundWorker(3000);
    // Sync initial live balances for 5SIM & OnlineSIM
    import('./services/providerService.js').then(({ providerService }) => {
        providerService.syncProviderBalances().catch((err) => {
            console.warn('Initial provider balance sync warning:', err);
        });
    });
});
// Graceful shutdown
const shutdown = () => {
    console.log('\n🛑 Shutting down backend gracefully...');
    otpOrderService_js_1.otpOrderService.stopBackgroundWorker();
    server.close(() => {
        console.log('✅ HTTP server closed. Process exiting.');
        process.exit(0);
    });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
