/**
 * Recent activity table — displays the last 10 automation events.
 */

import { RecentAutomationItem } from '../types/dashboard';

interface RecentActivityProps {
  data: RecentAutomationItem[];
  loading?: boolean;
}

const EVENT_LABELS: Record<string, string> = {
  order_created: 'طلب جديد',
  order_cancelled: 'إلغاء طلب',
  cart_abandoned: 'سلة متروكة',
  cart_recovered: 'سلة مستردة',
  customer_created: 'عميل جديد',
  order_shipped: 'شحن الطلب',
  order_delivered: 'تسليم الطلب',
  token_refresh: 'تجديد التوكن',
  welcome_message: 'رسالة ترحيب',
  upsell_triggered: 'عرض ترقية',
  winback_triggered: 'استعادة عميل',
};

const STATUS_STYLES: Record<string, string> = {
  success: 'bg-emerald-50 text-emerald-700',
  failed: 'bg-red-50 text-red-700',
  pending: 'bg-amber-50 text-amber-700',
  skipped: 'bg-slate-50 text-slate-600',
};

const STATUS_LABELS: Record<string, string> = {
  success: 'نجح',
  failed: 'فشل',
  pending: 'قيد الانتظار',
  skipped: 'تم التخطي',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function RecentActivity({ data, loading = false }: RecentActivityProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h3 className="text-sm font-bold text-slate-700 mb-5">آخر أحداث الأتمتة</h3>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-slate-400 text-sm">
          لا توجد أحداث حديثة
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-right py-3 px-2 text-xs font-semibold text-slate-500">الحدث</th>
                <th className="text-right py-3 px-2 text-xs font-semibold text-slate-500">رقم العميل</th>
                <th className="text-right py-3 px-2 text-xs font-semibold text-slate-500">الحالة</th>
                <th className="text-right py-3 px-2 text-xs font-semibold text-slate-500">التوقيت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((item, index) => {
                const statusKey = item.status?.toLowerCase() ?? '';
                return (
                  <tr key={index} className="hover:bg-slate-50 transition-colors duration-100">
                    <td className="py-3 px-2 font-medium text-slate-700">
                      {EVENT_LABELS[item.event_type] ?? item.event_type}
                    </td>
                    <td className="py-3 px-2 text-slate-500">
                      {item.customer_id ? `#${item.customer_id}` : '—'}
                    </td>
                    <td className="py-3 px-2">
                      {item.status ? (
                        <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${STATUS_STYLES[statusKey] ?? 'bg-slate-50 text-slate-600'}`}>
                          {STATUS_LABELS[statusKey] ?? item.status}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-slate-400 text-xs">
                      {formatDate(item.triggered_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
