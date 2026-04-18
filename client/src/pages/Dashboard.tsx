/**
 * Dashboard page — main overview with KPI cards, charts, and recent activity.
 * Fetches all data from GET /api/dashboard/stats?merchant_id=1
 */

import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { DashboardStats } from '../types/dashboard';
import KPICard from '../components/KPICard';
import SegmentChart from '../components/SegmentChart';
import PaymentChart from '../components/PaymentChart';
import RecentActivity from '../components/RecentActivity';

const MERCHANT_ID = 1;

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get<{ success: boolean; data: DashboardStats }>(
          `/api/dashboard/stats?merchant_id=${MERCHANT_ID}`
        );
        if (response.data.success) {
          setStats(response.data.data);
        } else {
          setError('فشل في تحميل البيانات');
        }
      } catch {
        setError('تعذّر الاتصال بالخادم');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const formatNumber = (n: number) => n.toLocaleString('ar-SA');
  const formatCurrency = (n: number) =>
    n.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 });

  return (
    <div className="p-8 min-h-screen">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">لوحة التحكم</h2>
        <p className="text-slate-500 text-sm mt-1">مرحباً بك — إليك ملخص متجرك</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        <KPICard
          label="إجمالي العملاء"
          value={stats ? formatNumber(stats.total_customers) : '—'}
          icon="👥"
          color="blue"
          loading={loading}
        />
        <KPICard
          label="إجمالي الطلبات"
          value={stats ? formatNumber(stats.total_orders) : '—'}
          icon="📦"
          color="primary"
          loading={loading}
        />
        <KPICard
          label="مبيعات واتساب"
          value={stats ? formatCurrency(stats.whatsapp_revenue) : '—'}
          icon="💬"
          color="green"
          loading={loading}
        />
        <KPICard
          label="سلال مستردة"
          value={stats ? formatNumber(stats.recovered_carts) : '—'}
          icon="🛒"
          color="teal"
          loading={loading}
        />
        <KPICard
          label="عملاء VIP"
          value={stats ? formatNumber(stats.vip_customers) : '—'}
          icon="⭐"
          color="amber"
          loading={loading}
        />
        <KPICard
          label="عملاء في خطر"
          value={stats ? formatNumber(stats.at_risk_customers) : '—'}
          icon="⚠️"
          color="red"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <SegmentChart data={stats?.segments_distribution ?? []} loading={loading} />
        <PaymentChart data={stats?.payment_distribution ?? []} loading={loading} />
      </div>

      <RecentActivity data={stats?.recent_automations ?? []} loading={loading} />
    </div>
  );
}
