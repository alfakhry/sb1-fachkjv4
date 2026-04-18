/**
 * SavedLists — bottom section of the Audience Builder.
 * Table of saved audience lists with sync action per row.
 */

import { AudienceList } from '../../types/audience';

interface Props {
  lists: AudienceList[];
  loading: boolean;
  syncingId: number | null;
  onSync: (id: number) => void;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function SavedLists({ lists, loading, syncingId, onSync }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-800">القوائم المحفوظة</h3>
      </div>

      {loading ? (
        <div className="p-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : lists.length === 0 ? (
        <div className="px-6 py-12 text-center text-slate-400 text-sm">
          لا توجد قوائم محفوظة بعد
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-semibold">
                <th className="px-6 py-3 text-right">الاسم</th>
                <th className="px-6 py-3 text-right">عدد العملاء</th>
                <th className="px-6 py-3 text-right">آخر مزامنة</th>
                <th className="px-6 py-3 text-right">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lists.map((list) => (
                <tr key={list.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{list.name}</td>
                  <td className="px-6 py-4 text-slate-600 font-mono">
                    {list.total_matched !== null
                      ? list.total_matched.toLocaleString('ar-SA')
                      : '—'}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{formatDate(list.last_synced_at)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onSync(list.id)}
                      disabled={syncingId === list.id || !list.mbiaat_label_id}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {syncingId === list.id ? 'جارٍ...' : 'مزامنة'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
