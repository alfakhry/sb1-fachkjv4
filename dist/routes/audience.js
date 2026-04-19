"use strict";
/**
 * Audience routes — three-layer audience list management and Mbiaat sync.
 *
 * Endpoints:
 *   GET  /audience/templates               — All 12 preset templates with live counts
 *   POST /audience/preview                 — Preview audience count + sample
 *   POST /audience/save                    — Save audience list with filters
 *   POST /audience/sync/:listId            — Sync audience list to Mbiaat labels
 *   GET  /audience/lists/:merchantId       — All saved lists for a merchant
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const audienceService_1 = require("../services/audienceService");
const prisma_1 = __importDefault(require("../lib/prisma"));
const router = (0, express_1.Router)();
router.get('/templates', async (req, res) => {
    try {
        const merchantId = req.query.merchant_id ? Number(req.query.merchant_id) : null;
        const templates = await Promise.all(audienceService_1.PRESET_TEMPLATES.map(async (template) => {
            let count = null;
            if (merchantId) {
                try {
                    const ids = await (0, audienceService_1.buildAudienceQuery)(merchantId, template.filters);
                    count = ids.length;
                }
                catch {
                    count = null;
                }
            }
            return { ...template, count };
        }));
        res.json({ success: true, data: templates });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        res.status(500).json({ success: false, error: msg });
    }
});
router.post('/preview', async (req, res) => {
    try {
        const { merchant_id, filters } = req.body;
        if (!merchant_id || !filters) {
            res.status(400).json({ success: false, error: 'merchant_id and filters are required' });
            return;
        }
        const result = await (0, audienceService_1.previewAudience)(merchant_id, filters);
        res.json({ success: true, data: result });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        res.status(500).json({ success: false, error: msg });
    }
});
router.post('/save', async (req, res) => {
    try {
        const { merchant_id, name, filters } = req.body;
        if (!merchant_id || !name || !filters) {
            res.status(400).json({ success: false, error: 'merchant_id, name, and filters are required' });
            return;
        }
        const merchant = await prisma_1.default.merchants.findUnique({
            where: { id: merchant_id },
            select: { mbiaat_api_token: true },
        });
        const list = await (0, audienceService_1.saveAudienceList)(merchant_id, name, filters, merchant?.mbiaat_api_token ?? null);
        res.json({ success: true, data: list });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        res.status(500).json({ success: false, error: msg });
    }
});
router.post('/sync/:listId', async (req, res) => {
    try {
        const listId = Number(req.params.listId);
        const { merchant_id } = req.body;
        if (!merchant_id || !listId) {
            res.status(400).json({ success: false, error: 'merchant_id and listId are required' });
            return;
        }
        const result = await (0, audienceService_1.syncAudienceToMbiaat)(merchant_id, listId);
        res.json({ success: true, data: result });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        res.status(500).json({ success: false, error: msg });
    }
});
router.get('/lists/:merchantId', async (req, res) => {
    try {
        const merchantId = Number(req.params.merchantId);
        if (!merchantId) {
            res.status(400).json({ success: false, error: 'merchantId is required' });
            return;
        }
        const lists = await (0, audienceService_1.getAudienceListsForMerchant)(merchantId);
        res.json({ success: true, data: lists });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        res.status(500).json({ success: false, error: msg });
    }
});
exports.default = router;
//# sourceMappingURL=audience.js.map