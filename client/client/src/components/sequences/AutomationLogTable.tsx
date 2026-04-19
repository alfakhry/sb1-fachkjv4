/**
 * AutomationLogTable — Section 2 of the Sequences Manager page.
 * Displays last 20 automation log entries with status badges.
 */

import {
  AutomationLogEntry,
  STATUS_LABELS,
  STATUS_STYLES,
} from '../../types/sequences';

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
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
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
        <div className="px-6 py-12 text-center text-slate-400 text-sm">
          لا توجد سجلات بعد
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-semibold">
                <th className="px-6 py-3 text-right">الحدث</th>
                <th className="px-6 py-3 text-right">العميل</th>
                <th className="px-6 py-3 text-right">الـ Sequence</th>
                <th className="px-6 py-3 text-right">الحالة</th>
                <th className="px-6 py-3 text-right">الوقت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => {
                const statusKey = log.status ?? 'skipped';
                const statusStyle = STATUS_STYLES[statusKey] ?? STATUS_STYLES['skipped'];
                const statusLabel = STATUS_LABELS[statusKey] ?? statusKey;

                return (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
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
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyle}`}
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
