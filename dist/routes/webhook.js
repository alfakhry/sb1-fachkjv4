"use strict";
/**
 * Webhook router — handles all inbound Salla webhook events.
 * Returns 200 immediately, then processes events asynchronously.
 *
 * Endpoints:
 *   POST /webhook/salla — Receives Salla webhook events
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const webhookVerifier_1 = require("../middleware/webhookVerifier");
const appStoreAuthorize_1 = require("../handlers/appStoreAuthorize");
const router = (0, express_1.Router)();
router.post('/salla', webhookVerifier_1.webhookVerifier, (req, res) => {
    res.status(200).json({ received: true });
    const payload = req.body;
    const event = payload?.event;
    if (!event) {
        console.warn('[webhook] Received payload with no event field');
        return;
    }
    switch (event) {
        case 'app.store.authorize':
            (0, appStoreAuthorize_1.appStoreAuthorize)(payload).catch((error) => {
                console.error('[webhook] Unhandled error in appStoreAuthorize:', error);
            });
            break;
        default:
            console.log(`[webhook] Received unhandled event: ${event}`);
            break;
    }
});
exports.default = router;
//# sourceMappingURL=webhook.js.map