/**
 * Dashboard service — aggregates KPI stats for the merchant dashboard.
 * Fetches all data from Prisma using strict merchant_id filtering.
 */
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
export declare function getDashboardStats(merchantId: number): Promise<DashboardStats>;
//# sourceMappingURL=dashboardService.d.ts.map