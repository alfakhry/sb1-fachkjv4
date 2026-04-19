"use strict";
// v2.0 - Smart Profile Engine + Audience System
// test push
// Updated
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
const path_1 = __importDefault(require("path"));
const prisma_1 = __importDefault(require("./lib/prisma"));
const webhook_1 = __importDefault(require("./routes/webhook"));
const audience_1 = __importDefault(require("./routes/audience"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const sequences_1 = __importDefault(require("./routes/sequences"));
const tokenRefresh_1 = require("./jobs/tokenRefresh");
const dailyTasks_1 = require("./jobs/dailyTasks");
const app = (0, express_1.default)();
const PORT = process.env.PORT ?? 3000;
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(process.cwd(), 'public')));
app.get('/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok', timestamp: new Date() } });
});
app.use('/webhook', webhook_1.default);
app.use('/audience', audience_1.default);
app.use('/api/dashboard', dashboard_1.default);
app.use('/api/sequences', sequences_1.default);
app.get('*', (_req, res) => {
    res.sendFile(path_1.default.join(process.cwd(), 'public', 'index.html'));
});
async function main() {
    await prisma_1.default.$connect();
    console.log('[server] Database connected');
    (0, tokenRefresh_1.startTokenRefreshJob)();
    (0, dailyTasks_1.startDailyTasksJob)();
    app.listen(PORT, () => {
        console.log(`[server] Running on port ${PORT}`);
        console.log('[server] Registered routes:');
        console.log('  GET  /health');
        console.log('  POST /webhook/salla');
        console.log('  GET  /audience/templates');
        console.log('  POST /audience/preview');
        console.log('  POST /audience/save');
        console.log('  POST /audience/sync/:listId');
        console.log('  GET  /audience/lists/:merchantId');
        console.log('  GET  /api/dashboard/stats');
        console.log('  GET  /api/sequences/:merchantId');
        console.log('  PUT  /api/sequences/:merchantId');
    });
}
main().catch((err) => {
    console.error('[server] Failed to start:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map