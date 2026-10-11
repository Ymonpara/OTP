import { app } from './app.js';
import { config } from './config/index.js';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 OTP Wallet Platform Backend running on http://localhost:${PORT}`);
  console.log(`🔧 Environment: ${config.nodeEnv}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/v1/health`);
  console.log(`⚡ API Documentation & Endpoints: http://localhost:${PORT}`);
  console.log(`=================================================`);
});
