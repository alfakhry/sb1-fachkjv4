/**
 * AutomationLogTable — Section 2 of the Sequences Manager page.
 * Displays last 20 automation log entries with status badges.
 */

import {
  AutomationLogEntry,
  STATUS_LABELS,
} from '../../types/sequences';

const STATUS_INLINE: Record<string, { bg: string; text: string }> = {
  success: { bg: '#ECFDF5', text: '#065F46' },
  failed:  { bg: '#FEF2F2', text: '#991B1B' },
  skipped: { bg: '#F8FAFC', text: '#475569' },
};

interface Props {
  logs: AutomationLogEntry[];
  loading: boolean;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('ar-SA', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AutomationLogTable({ logs, loading }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-800">سجل الأتمتة</h3>
        <p className="text-xs text-slate-400 mt-0.5">آخر 20 عملية</p>
      </div>

      {loading ? (
        <div className="p-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="px-6 py-12 flex flex-col items-center gap-2 text-slate-400">
          <span className="text-3xl">📋</span>
          <p className="text-sm">لا توجد سجلات بعد</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC' }}>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500">الحدث</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500">العميل</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500">الـ Sequence</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500">الوقت</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => {
                const statusKey = log.status ?? 'skipped';
                const statusStyle = STATUS_INLINE[statusKey] ?? STATUS_INLINE['skipped'];
                const statusLabel = STATUS_LABELS[statusKey] ?? statusKey;

                return (
                  <tr
                    key={log.id}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-default"
                    style={{ backgroundColor: index % 2 === 1 ? '#F8FAFC' : '#ffffff' }}
                  >
                    <td className="px-6 py-3 font-mono text-xs text-slate-700">
                      {log.event_type}
                    </td>
                    <td className="px-6 py-3 text-slate-700">
                      {log.customer?.name ?? (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      {log.sequence_name ? (
                        <span className="text-slate-700">{log.sequence_name}</span>
                      ) : log.sequence_id ? (
                        <span className="font-mono text-xs text-slate-500">
                          {log.sequence_id}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                      >
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {formatDate(log.triggered_at)}
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
