/**
 * Dashboard service — aggregates KPI stats for the merchant dashboard.
 * Fetches all data from Prisma using strict merchant_id filtering.
 */

import prisma from '../lib/prisma';

export interface SegmentDistributionItem {
  segment: string;
  display: string;
  count: number;
}

export interface PaymentDistributionItem {
  method: string;
  count: number;
}

export interface RecentAutomationItem {
  event_type: string;
  customer_id: number | null;
  status: string | null;
  triggered_at: Date;
}

export interface DashboardStats {
  total_customers: number;
  total_orders: number;
  whatsapp_revenue: number;
  recovered_carts: number;
  vip_customers: number;
  at_risk_customers: number;
  segments_distribution: SegmentDistributionItem[];
  payment_distribution: PaymentDistributionItem[];
  recent_automations: RecentAutomationItem[];
}

/**
 * Fetches all dashboard KPI stats for a given merchant.
 */
export async function getDashboardStats(merchantId: number): Promise<DashboardStats> {
  try {
    const [
      total_customers,
      total_orders,
      whatsappRevenueResult,
      recovered_carts,
      vip_customers,
      at_risk_customers,
      rawSegments,
      rawPayments,
      recent_automations,
    ] = await Promise.all([
      prisma.customers.count({
        where: { merchant_id: merchantId },
      }),

      prisma.orders.count({
        where: { merchant_id: merchantId },
      }),

      prisma.smart_profiles.aggregate({
        where: { merchant_id: merchantId },
        _sum: { whatsapp_revenue: true },
      }),

      prisma.abandoned_carts.count({
        where: { merchant_id: merchantId, status: 'recovered' },
      }),

      prisma.smart_profiles.count({
        where: { merchant_id: merchantId, segment: 'VIP' },
      }),

      prisma.smart_profiles.count({
        where: { merchant_id: merchantId, segment: 'AT_RISK' },
      }),

      prisma.smart_profiles.groupBy({
        by: ['segment', 'segment_display'],
        where: { merchant_id: merchantId },
        _count: { segment: true },
      }),

      prisma.orders.groupBy({
        by: ['payment_method'],
        where: { merchant_id: merchantId },
        _count: { payment_method: true },
      }),

      prisma.automation_log.findMany({
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

    const segments_distribution: SegmentDistributionItem[] = rawSegments.map((row) => ({
      segment: row.segment,
      display: row.segment_display ?? row.segment,
      count: row._count.segment,
    }));

    const payment_distribution: PaymentDistributionItem[] = rawPayments
      .filter((row) => row.payment_method !== null)
      .map((row) => ({
        method: row.payment_method as string,
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
  } catch (err) {
    console.error('[dashboardService] getDashboardStats error:', err);
    throw err;
  }
}
