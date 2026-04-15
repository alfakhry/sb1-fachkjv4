"use strict";
/**
 * Application entry point.
 * Initializes the Express server, registers routes, and starts background jobs.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const prisma_1 = __importDefault(require("./lib/prisma"));
const webhook_1 = __importDefault(require("./routes/webhook"));
const tokenRefresh_1 = require("./jobs/tokenRefresh");
const app = (0, express_1.default)();
const PORT = process.env.PORT ?? 3000;
app.use(express_1.default.json());
app.get('/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok', timestamp: new Date() } });
});
app.use('/webhook', webhook_1.default);
async function main() {
    await prisma_1.default.$connect();
    console.log('[server] Database connected');
    (0, tokenRefresh_1.startTokenRefreshJob)();
    app.listen(PORT, () => {
        console.log(`[server] Running on port ${PORT}`);
        console.log('[server] Registered routes:');
        console.log('  GET  /health');
        console.log('  POST /webhook/salla');
    });
}
main().catch((err) => {
    console.error('[server] Failed to start:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map