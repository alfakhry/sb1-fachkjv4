/**
 * Middleware to verify the HMAC-SHA256 signature on incoming Salla webhooks.
 * Skips verification in development when SALLA_WEBHOOK_SECRET is not set.
 */
import { Request, Response, NextFunction } from 'express';
export declare function webhookVerifier(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=webhookVerifier.d.ts.map