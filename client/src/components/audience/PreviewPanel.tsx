/**
 * PreviewPanel — right-side sticky panel in the Audience Builder.
 * Shows preview count, sample customers, save form, and quick sync button.
 */

import { ChangeEvent } from 'react';
import { AudienceList, PreviewResult, SEGMENT_COLORS } from '../../types/audience';

interface Props {
  preview: PreviewResult | null;
  loading: boolean;
  error: string | null;
  listName: string;
  onListNameChange: (v: string) => void;
  onSave: () => void;
  saving: boolean;
  saveError: string | null;
  saveSuccess: boolean;
  syncingId: number | null;
  syncResult: string | null;
  onSync: (id: number) => void;
  savedLists: AudienceList[];
}

function SegmentBadge({ segment }: { segment: string }) {
  const cls = SEGMENT_COLORS[segment] ?? SEGMENT_COLORS['UNKNOWN'];
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {segment}
    </span>
  );
}

export default function PreviewPanel({
  preview,
  loading,
  error,
  listName,
  onListNameChange,
  onSave,
  saving,
  saveError,
  saveSuccess,
  syncingId,
  onSync,
  savedLists,
}: Props) {
  const lastSavedList = savedLists[0] ?? null;

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 sticky top-6 space-y-5">
      <h3 className="text-base font-semibold text-slate-800">معاينة الجمهور</h3>

      {loading && (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: '#4F46E5', borderTopColor: 'transparent' }}
          />
          <p className="text-sm text-slate-400">جارٍ التحليل...</p>
        </div>
      )}

      {error && !loading && (
        <div
          className="text-sm rounded-xl px-4 py-3"
          style={{ backgroundColor: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}
        >
          {error}
        </div>
      )}

      {!loading && !error && preview && (
        <>
          <div className="rounded-xl px-4 py-4 text-center" style={{ backgroundColor: '#EEF2FF' }}>
            <p className="text-3xl font-bold" style={{ color: '#3730A3' }}>
              {preview.count.toLocaleString('ar-SA')}
            </p>
            <p className="text-sm mt-1" style={{ color: '#4F46E5' }}>عميل مطابق</p>
          </div>

          {preview.sample.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">عينة العملاء</p>
              <div className="space-y-2">
                {preview.sample.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-2 bg-slate-50 rounded-lg px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {c.name ?? 'بدون اسم'}
                      </p>
                      {c.phone && (
                        <p className="text-xs text-slate-400 font-mono">{c.phone}</p>
                      )}
                    </div>
                    <SegmentBadge segment={c.segment} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!loading && !preview && !error && (
        <div className="text-center py-8 text-slate-400 text-sm">
          اضبط الفلاتر واضغط معاينة
        </div>
      )}

      <div className="border-t border-slate-100 pt-4 space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">اسم القائمة</label>
          <input
            type="text"
            value={listName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onListNameChange(e.target.value)}
            placeholder="مثال: عملاء VIP الرياض"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition"
          />
        </div>

        {saveError && (
          <p className="text-xs" style={{ color: '#991B1B' }}>{saveError}</p>
        )}
        {saveSuccess && (
          <p className="text-xs font-medium" style={{ color: '#065F46' }}>تم حفظ القائمة بنجاح</p>
        )}

        <button
          onClick={onSave}
          disabled={saving || !listName.trim()}
          className="w-full px-4 py-2.5 text-white text-sm font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{ backgroundColor: '#4F46E5' }}
        >
          {saving ? 'جارٍ الحفظ...' : 'حفظ القائمة'}
        </button>

        {lastSavedList && (
          <button
            onClick={() => onSync(lastSavedList.id)}
            disabled={syncingId === lastSavedList.id || !lastSavedList.mbiaat_label_id}
            className="w-full px-4 py-2.5 text-white text-sm font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ backgroundColor: '#10B981' }}
          >
            {syncingId === lastSavedList.id ? 'جارٍ المزامنة...' : 'مزامنة مع مبيعات'}
          </button>
        )}
      </div>
    </div>
  );
}
