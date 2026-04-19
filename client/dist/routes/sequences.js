"use strict";
/**
 * Sequences routes — manage automation sequences config and read automation logs.
 *
 * Endpoints:
 *   GET /api/sequences/:merchantId — Get sequences config + automation log stats + last 20 log entries
 *   PUT /api/sequences/:merchantId — Create or update sequences config for merchant
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const router = (0, express_1.Router)();
/**
 * GET /api/sequences/:merchantId
 * Returns the sequences config, last 20 automation log entries, and aggregate stats.
 */
router.get('/:merchantId', async (req, res) => {
    try {
        const merchantId = Number(req.params.merchantId);
        if (!merchantId) {
            res.status(400).json({ success: false, error: 'merchantId is required' });
            return;
        }
        const config = await prisma_1.default.sequences_config.findUnique({
            where: { merchant_id: merchantId },
        });
        const logs = await prisma_1.default.automation_log.findMany({
            where: { merchant_id: merchantId },
            orderBy: { triggered_at: 'desc' },
            take: 20,
            include: {
                customer: { select: { name: true, phone: true } },
            },
        });
        const statsRaw = await prisma_1.default.automation_log.groupBy({
            by: ['status'],
            where: { merchant_id: merchantId },
            _count: { id: true },
        });
        const stats = { total: 0, success: 0, failed: 0, skipped: 0 };
        for (const row of statsRaw) {
            const count = row._count.id;
            stats.total += count;
            if (row.status === 'success')
                stats.success = count;
            else if (row.status === 'failed')
                stats.failed = count;
            else if (row.status === 'skipped')
                stats.skipped = count;
        }
        const successRate = stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0;
        res.json({
            success: true,
            data: { config, logs, stats: { ...stats, successRate } },
        });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[sequences] GET error:', msg);
        res.status(500).json({ success: false, error: msg });
    }
});
/**
 * PUT /api/sequences/:merchantId
 * Upserts the sequences config row for the given merchant.
 */
router.put('/:merchantId', async (req, res) => {
    try {
        const merchantId = Number(req.params.merchantId);
        if (!merchantId) {
            res.status(400).json({ success: false, error: 'merchantId is required' });
            return;
        }
        const { welcome_sequence_id, welcome_enabled, order_confirm_sequence_id, order_confirm_enabled, cod_convert_sequence_id, cod_convert_enabled, abandoned_cart_sequence_id, abandoned_cart_delay_minutes, abandoned_cart_enabled, shipping_update_sequence_id, shipping_update_enabled, rating_sequence_id, rating_delay_days, rating_enabled, upsell_sequence_id, upsell_delay_days, upsell_enabled, winback_sequence_id, winback_delay_days, winback_enabled, prospect_sequence_id, prospect_delay_hours, prospect_enabled, } = req.body;
        const data = {
            welcome_sequence_id: welcome_sequence_id ?? null,
            order_confirm_sequence_id: order_confirm_sequence_id ?? null,
            cod_convert_sequence_id: cod_convert_sequence_id ?? null,
            abandoned_cart_sequence_id: abandoned_cart_sequence_id ?? null,
            abandoned_cart_delay_minutes: abandoned_cart_delay_minutes !== undefined
                ? Number(abandoned_cart_delay_minutes)
                : 30,
            shipping_update_sequence_id: shipping_update_sequence_id ?? null,
            rating_sequence_id: rating_sequence_id ?? null,
            rating_delay_days: rating_delay_days !== undefined ? Number(rating_delay_days) : 3,
            upsell_sequence_id: upsell_sequence_id ?? null,
            upsell_delay_days: upsell_delay_days !== undefined ? Number(upsell_delay_days) : 7,
            winback_sequence_id: winback_sequence_id ?? null,
            winback_delay_days: winback_delay_days !== undefined ? Number(winback_delay_days) : 30,
            prospect_sequence_id: prospect_sequence_id ?? null,
            prospect_delay_hours: prospect_delay_hours !== undefined ? Number(prospect_delay_hours) : 24,
            welcome_enabled: Boolean(welcome_enabled ?? true),
            order_confirm_enabled: Boolean(order_confirm_enabled ?? true),
            cod_convert_enabled: Boolean(cod_convert_enabled ?? true),
            abandoned_cart_enabled: Boolean(abandoned_cart_enabled ?? true),
            shipping_update_enabled: Boolean(shipping_update_enabled ?? true),
            rating_enabled: Boolean(rating_enabled ?? true),
            upsell_enabled: Boolean(upsell_enabled ?? true),
            winback_enabled: Boolean(winback_enabled ?? true),
            prospect_enabled: Boolean(prospect_enabled ?? true),
        };
        const config = await prisma_1.default.sequences_config.upsert({
            where: { merchant_id: merchantId },
            create: { merchant_id: merchantId, ...data },
            update: data,
        });
        res.json({ success: true, data: config });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[sequences] PUT error:', msg);
        res.status(500).json({ success: false, error: msg });
    }
});
exports.default = router;
//# sourceMappingURL=sequences.js.map