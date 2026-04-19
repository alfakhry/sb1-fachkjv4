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

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  success: { bg: '#ECFDF5', text: '#065F46' },
  failed:  { bg: '#FEF2F2', text: '#991B1B' },
  pending: { bg: '#FFFBEB', text: '#92400E' },
  skipped: { bg: '#F8FAFC', text: '#475569' },
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-100">
      <div className="px-6 py-5 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-800">آخر أحداث الأتمتة</h3>
      </div>

      {loading ? (
        <div className="p-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="h-32 flex flex-col items-center justify-center gap-2 text-slate-400">
          <span className="text-3xl">📭</span>
          <p className="text-sm">لا توجد أحداث حديثة</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC' }}>
                <th className="text-right py-3 px-6 text-xs font-semibold text-slate-500">الحدث</th>
                <th className="text-right py-3 px-6 text-xs font-semibold text-slate-500">رقم العميل</th>
                <th className="text-right py-3 px-6 text-xs font-semibold text-slate-500">الحالة</th>
                <th className="text-right py-3 px-6 text-xs font-semibold text-slate-500">التوقيت</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => {
                const statusKey = item.status?.toLowerCase() ?? '';
                const statusStyle = STATUS_STYLES[statusKey] ?? STATUS_STYLES['skipped'];
                return (
                  <tr
                    key={index}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors duration-100 cursor-default"
                    style={{ backgroundColor: index % 2 === 1 ? '#F8FAFC' : '#ffffff' }}
                  >
                    <td className="py-3.5 px-6 font-medium text-slate-700">
                      {EVENT_LABELS[item.event_type] ?? item.event_type}
                    </td>
                    <td className="py-3.5 px-6 text-slate-500 font-mono text-xs">
                      {item.customer_id ? `#${item.customer_id}` : '—'}
                    </td>
                    <td className="py-3.5 px-6">
                      {item.status ? (
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                        >
                          {STATUS_LABELS[statusKey] ?? item.status}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-slate-400 text-xs whitespace-nowrap">
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
