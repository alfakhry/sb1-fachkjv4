/**
 * Webhook router — handles all inbound Salla webhook events.
 * Returns 200 immediately, then processes events asynchronously.
 *
 * Endpoints:
 *   POST /webhook/salla — Receives Salla webhook events
 */

import { Router, Request, Response } from 'express';
import { webhookVerifier } from '../middleware/webhookVerifier';
import { appStoreAuthorize } from '../handlers/appStoreAuthorize';
import { SallaWebhookPayload } from '../types';

const router = Router();

router.post('/salla', webhookVerifier, (req: Request, res: Response): void => {
  res.status(200).json({ received: true });

  const payload = req.body as SallaWebhookPayload;
  const event = payload?.event;

  if (!event) {
    console.warn('[webhook] Received payload with no event field');
    return;
  }

  switch (event) {
    case 'app.store.authorize':
      appStoreAuthorize(payload).catch((error) => {
        console.error('[webhook] Unhandled error in appStoreAuthorize:', error);
      });
      break;

    default:
      console.log(`[webhook] Received unhandled event: ${event}`);
      break;
  }
});

export default router;
