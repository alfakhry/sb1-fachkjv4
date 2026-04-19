"use strict";
/**
 * Middleware to verify the HMAC-SHA256 signature on incoming Salla webhooks.
 * Skips verification in development when SALLA_WEBHOOK_SECRET is not set.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookVerifier = webhookVerifier;
const crypto_1 = __importDefault(require("crypto"));
function webhookVerifier(req, res, next) {
    const secret = process.env.SALLA_WEBHOOK_SECRET;
    if (!secret) {
        console.warn('[webhookVerifier] SALLA_WEBHOOK_SECRET not set — skipping signature verification');
        next();
        return;
    }
    const signature = req.headers['x-salla-signature'];
    const payload = JSON.stringify(req.body);
    const expected = crypto_1.default
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
    if (signature !== expected) {
        res.status(401).json({ success: false, error: 'Invalid signature' });
        return;
    }
    next();
}
//# sourceMappingURL=webhookVerifier.js.map