/**
 * TemplateCards — Layer 1 of Audience Builder.
 * Displays 12 preset audience template cards with live counts.
 */

import { PresetTemplate } from '../../types/audience';

interface Props {
  templates: PresetTemplate[];
  loading: boolean;
  onSelect: (template: PresetTemplate) => void;
}

export default function TemplateCards({ templates, loading, onSelect }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h3 className="text-base font-semibold text-slate-800 mb-4">قوالب جاهزة</h3>

      {loading ? (
        <div className="grid grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 xl:grid-cols-4 gap-3">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelect(t)}
              className="group flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-primary-50 hover:border-primary-200 transition-all duration-150 text-center cursor-pointer"
            >
              <span className="text-2xl leading-none">{t.icon}</span>
              <span className="text-xs font-medium text-slate-700 group-hover:text-primary-700 leading-tight">
                {t.name}
              </span>
              {t.count !== null && (
                <span className="text-xs text-slate-400 group-hover:text-primary-500 font-mono">
                  {t.count.toLocaleString('ar-SA')}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
