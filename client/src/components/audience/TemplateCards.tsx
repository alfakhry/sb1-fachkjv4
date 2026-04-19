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
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
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
              className="group flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-100 bg-slate-50 transition-all duration-150 text-center cursor-pointer"
              style={{ }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#EEF2FF';
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#A5B4FC';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F8FAFC';
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#F1F5F9';
              }}
            >
              <span className="text-2xl leading-none">{t.icon}</span>
              <span className="text-xs font-medium text-slate-700 leading-tight">
                {t.name}
              </span>
              {t.count !== null && (
                <span className="text-xs text-slate-400 font-mono">
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
