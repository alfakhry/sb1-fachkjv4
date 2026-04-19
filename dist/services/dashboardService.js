"use strict";
/**
 * Dashboard service — aggregates KPI stats for the merchant dashboard.
 * Fetches all data from Prisma using strict merchant_id filtering.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = getDashboardStats;
const prisma_1 = __importDefault(require("../lib/prisma"));
/**
 * Fetches all dashboard KPI stats for a given merchant.
 */
async function getDashboardStats(merchantId) {
    try {
        const [total_customers, total_orders, whatsappRevenueResult, recovered_carts, vip_customers, at_risk_customers, rawSegments, rawPayments, recent_automations,] = await Promise.all([
            prisma_1.default.customers.count({
                where: { merchant_id: merchantId },
            }),
            prisma_1.default.orders.count({
                where: { merchant_id: merchantId },
            }),
            prisma_1.default.smart_profiles.aggregate({
                where: { merchant_id: merchantId },
                _sum: { whatsapp_revenue: true },
            }),
            prisma_1.default.abandoned_carts.count({
                where: { merchant_id: merchantId, status: 'recovered' },
            }),
            prisma_1.default.smart_profiles.count({
                where: { merchant_id: merchantId, segment: 'VIP' },
            }),
            prisma_1.default.smart_profiles.count({
                where: { merchant_id: merchantId, segment: 'AT_RISK' },
            }),
            prisma_1.default.smart_profiles.groupBy({
                by: ['segment', 'segment_display'],
                where: { merchant_id: merchantId },
                _count: { segment: true },
            }),
            prisma_1.default.orders.groupBy({
                by: ['payment_method'],
                where: { merchant_id: merchantId },
                _count: { payment_method: true },
            }),
            prisma_1.default.automation_log.findMany({
                where: { merchant_id: merchantId },
                orderBy: { triggered_at: 'desc' },
                take: 10,
                select: {
                    event_type: true,
                    customer_id: true,
                    status: true,
                    triggered_at: true,
                },
            }),
        ]);
        const segments_distribution = rawSegments.map((row) => ({
            segment: row.segment,
            display: row.segment_display ?? row.segment,
            count: row._count.segment,
        }));
        const payment_distribution = rawPayments
            .filter((row) => row.payment_method !== null)
            .map((row) => ({
            method: row.payment_method,
            count: row._count.payment_method,
        }));
        return {
            total_customers,
            total_orders,
            whatsapp_revenue: Number(whatsappRevenueResult._sum.whatsapp_revenue ?? 0),
            recovered_carts,
            vip_customers,
            at_risk_customers,
            segments_distribution,
            payment_distribution,
            recent_automations,
        };
    }
    catch (err) {
        console.error('[dashboardService] getDashboardStats error:', err);
        throw err;
    }
}
//# sourceMappingURL=dashboardService.js.map