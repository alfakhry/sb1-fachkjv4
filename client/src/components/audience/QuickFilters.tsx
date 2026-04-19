/**
 * QuickFilters — Layer 2 of Audience Builder.
 * Four side-by-side dropdowns/inputs for fast audience filtering.
 */

import { ChangeEvent } from 'react';
import { SEGMENT_OPTIONS, PAYMENT_OPTIONS } from '../../types/audience';

interface Props {
  segment: string;
  payment: string;
  city: string;
  category: string;
  onSegmentChange: (v: string) => void;
  onPaymentChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onPreview: () => void;
  previewLoading: boolean;
}

const inputClass = "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none transition";

export default function QuickFilters({
  segment,
  payment,
  city,
  category,
  onSegmentChange,
  onPaymentChange,
  onCityChange,
  onCategoryChange,
  onPreview,
  previewLoading,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      <h3 className="text-base font-semibold text-slate-800 mb-4">فلاتر سريعة</h3>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">الشريحة</label>
          <select
            value={segment}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => onSegmentChange(e.target.value)}
            className={inputClass}
          >
            <option value="">الكل</option>
            {SEGMENT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">طريقة الدفع</label>
          <select
            value={payment}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => onPaymentChange(e.target.value)}
            className={inputClass}
          >
            <option value="">الكل</option>
            {PAYMENT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">المدينة</label>
          <input
            type="text"
            value={city}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onCityChange(e.target.value)}
            placeholder="مثال: الرياض"
            className={`${inputClass} placeholder-slate-400`}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">الفئة</label>
          <input
            type="text"
            value={category}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onCategoryChange(e.target.value)}
            placeholder="مثال: إلكترونيات"
            className={`${inputClass} placeholder-slate-400`}
          />
        </div>
      </div>

      <button
        onClick={onPreview}
        disabled={previewLoading || (!segment && !payment && !city && !category)}
        className="px-6 py-2.5 text-white text-sm font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center gap-2"
        style={{ backgroundColor: '#4F46E5' }}
      >
        {previewLoading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            جارٍ المعاينة...
          </>
        ) : (
          'معاينة'
        )}
      </button>
    </div>
  );
}
