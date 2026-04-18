/**
 * AdvancedFilters — Layer 3 of Audience Builder.
 * Expandable section for building custom filter rows with field/operator/value/type.
 */

import { AudienceFilter, ADVANCED_FIELDS, OPERATORS } from '../../types/audience';

interface Props {
  open: boolean;
  onToggle: () => void;
  filters: AudienceFilter[];
  onFiltersChange: (filters: AudienceFilter[]) => void;
}

function emptyFilter(): AudienceFilter {
  return { field: 'segment', operator: 'equals', value: '', type: 'INCLUDE' };
}

export default function AdvancedFilters({ open, onToggle, filters, onFiltersChange }: Props) {
  function addRow() {
    onFiltersChange([...filters, emptyFilter()]);
  }

  function removeRow(index: number) {
    onFiltersChange(filters.filter((_, i) => i !== index));
  }

  function updateRow(index: number, patch: Partial<AudienceFilter>) {
    onFiltersChange(filters.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
      >
        <span>فلاتر متقدمة {filters.length > 0 && `(${filters.length})`}</span>
        <span className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {open && (
        <div className="px-6 pb-6 border-t border-slate-100">
          <div className="space-y-3 mt-4">
            {filters.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">
                لا توجد فلاتر متقدمة — أضف فلتراً للبدء
              </p>
            )}

            {filters.map((f, i) => (
              <div key={i} className="flex gap-2 items-center">
                <select
                  value={f.field}
                  onChange={(e) => updateRow(i, { field: e.target.value })}
                  className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-300 transition"
                >
                  {ADVANCED_FIELDS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>

                <select
                  value={f.operator}
                  onChange={(e) => updateRow(i, { operator: e.target.value })}
                  className="w-32 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-300 transition"
                >
                  {OPERATORS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>

                <input
                  type="text"
                  value={String(f.value ?? '')}
                  onChange={(e) => updateRow(i, { value: e.target.value })}
                  placeholder="القيمة"
                  className="w-28 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-300 transition"
                />

                {f.operator === 'between' && (
                  <input
                    type="text"
                    value={String(f.value2 ?? '')}
                    onChange={(e) => updateRow(i, { value2: e.target.value })}
                    placeholder="حتى"
                    className="w-20 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-300 transition"
                  />
                )}

                <button
                  onClick={() => updateRow(i, { type: f.type === 'INCLUDE' ? 'EXCLUDE' : 'INCLUDE' })}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    f.type === 'INCLUDE'
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {f.type === 'INCLUDE' ? 'تضمين' : 'استثناء'}
                </button>

                <button
                  onClick={() => removeRow(i)}
                  className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors flex items-center justify-center text-sm font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addRow}
            className="mt-4 px-4 py-2 rounded-lg border border-dashed border-primary-300 text-primary-600 text-sm font-medium hover:bg-primary-50 transition-colors"
          >
            + إضافة فلتر
          </button>
        </div>
      )}
    </div>
  );
}
