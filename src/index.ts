// v2.0 - Smart Profile Engine + Audience System
// test push
// Updated
/**
 * Application entry point.
 * Initializes the Express server, registers routes, and starts background jobs.
 */

import 'dotenv/config';
import express from 'express';
import path from 'path';
import prisma from './lib/prisma';
import webhookRouter from './routes/webhook';
import audienceRouter from './routes/audience';
import dashboardRouter from './routes/dashboard';
import sequencesRouter from './routes/sequences';
import { startTokenRefreshJob } from './jobs/tokenRefresh';
import { startDailyTasksJob } from './jobs/dailyTasks';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date() } });
});

app.use('/webhook', webhookRouter);
app.use('/audience', audienceRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/sequences', sequencesRouter);

app.get('*', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

async function main(): Promise<void> {
  await prisma.$connect();
  console.log('[server] Database connected');

  startTokenRefreshJob();
  startDailyTasksJob();

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
