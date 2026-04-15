/**
 * Application entry point.
 * Initializes the Express server, registers routes, and starts background jobs.
 */

import 'dotenv/config';
import express from 'express';
import prisma from './lib/prisma';
import webhookRouter from './routes/webhook';
import { startTokenRefreshJob } from './jobs/tokenRefresh';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date() } });
});

app.use('/webhook', webhookRouter);

async function main(): Promise<void> {
  await prisma.$connect();
  console.log('[server] Database connected');

  startTokenRefreshJob();

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
