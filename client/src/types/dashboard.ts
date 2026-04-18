/**
 * TypeScript types for dashboard API responses.
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
  triggered_at: string;
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
