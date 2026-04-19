"use strict";
/**
 * Dashboard routes.
 *
 * Endpoints:
 *   GET /api/dashboard/stats?merchant_id={id} — Aggregated KPI stats for the merchant dashboard
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboardService_1 = require("../services/dashboardService");
const router = (0, express_1.Router)();
router.get('/stats', async (req, res) => {
    try {
        const merchantId = Number(req.query.merchant_id);
        if (!merchantId || isNaN(merchantId)) {
            res.status(400).json({ success: false, error: 'merchant_id is required and must be a number' });
            return;
        }
        const stats = await (0, dashboardService_1.getDashboardStats)(merchantId);
        res.json({ success: true, data: stats });
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[dashboard route] GET /stats error:', msg);
        res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.js.map