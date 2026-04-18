/**
 * Dashboard routes.
 *
 * Endpoints:
 *   GET /api/dashboard/stats?merchant_id={id} — Aggregated KPI stats for the merchant dashboard
 */

import { Router, Request, Response } from 'express';
import { getDashboardStats } from '../services/dashboardService';

const router = Router();

router.get('/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const merchantId = Number(req.query.merchant_id);

    if (!merchantId || isNaN(merchantId)) {
      res.status(400).json({ success: false, error: 'merchant_id is required and must be a number' });
      return;
    }

    const stats = await getDashboardStats(merchantId);
    res.json({ success: true, data: stats });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[dashboard route] GET /stats error:', msg);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
