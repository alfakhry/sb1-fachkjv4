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
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
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
        <div className="px-6 py-12 flex flex-col items-center gap-2 text-slate-400">
          <span className="text-3xl">📋</span>
          <p className="text-sm">لا توجد قوائم محفوظة بعد</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC' }}>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500">الاسم</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500">عدد العملاء</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500">آخر مزامنة</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {lists.map((list, index) => (
                <tr
                  key={list.id}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-default"
                  style={{ backgroundColor: index % 2 === 1 ? '#F8FAFC' : '#ffffff' }}
                >
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
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      style={{ backgroundColor: '#ECFDF5', color: '#065F46' }}
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
