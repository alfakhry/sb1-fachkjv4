/**
 * Middleware to verify the HMAC-SHA256 signature on incoming Salla webhooks.
 * Skips verification in development when SALLA_WEBHOOK_SECRET is not set.
 */

import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

export function webhookVerifier(req: Request, res: Response, next: NextFunction): void {
  console.log('[webhook] Received request, headers:', JSON.stringify(req.headers));

  const secret = process.env.SALLA_WEBHOOK_SECRET;

  if (!secret) {
    console.warn('[webhookVerifier] WARNING: SALLA_WEBHOOK_SECRET is not set — passing through without signature verification');
    next();
    return;
  }

  const signature = req.headers['x-salla-signature'] as string | undefined;
  const payload = JSON.stringify(req.body);

  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  const signatureMatch = signature === expected;
  console.log('[webhookVerifier] Signature check:', {
    provided: signature ?? '(none)',
    expected,
    match: signatureMatch,
  });

  if (!signatureMatch) {
    res.status(401).json({ success: false, error: 'Invalid signature' });
    return;
  }

  next();
}
