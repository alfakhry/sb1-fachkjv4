/**
 * SequenceCard — single automation sequence row with toggle, ID input, and optional delay.
 */

import React, { ChangeEvent } from 'react';
import {
  SequenceDefinition,
  SequencesConfig,
  DELAY_UNIT_LABELS,
} from '../../types/sequences';

interface Props {
  definition: SequenceDefinition;
  config: SequencesConfig;
  onChange: (patch: Partial<SequencesConfig>) => void;
}

export default function SequenceCard({ definition, config, onChange }: Props) {
  const { label, icon, idField, enabledField, delayField, delayUnit } = definition;
  const enabled = config[enabledField] as boolean;
  const seqId = (config[idField] as string | null) ?? '';
  const delay = delayField ? (config[delayField] as number) : null;

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl border transition-all duration-150"
      style={{
        backgroundColor: enabled ? '#ffffff' : '#F8FAFC',
        borderColor: enabled ? '#E2E8F0' : '#F1F5F9',
        opacity: enabled ? 1 : 0.65,
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ backgroundColor: '#EEF2FF' }}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 mb-2">{label}</p>
        <div className="flex gap-2 items-center flex-wrap">
          <input
            type="text"
            value={seqId}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ [idField]: e.target.value || null })}
            placeholder="Sequence ID"
            disabled={!enabled}
            className="w-44 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 font-mono focus:outline-none disabled:opacity-50 transition"
            style={{ focusRingColor: '#4F46E5' } as React.CSSProperties}
          />
          {delayField && delayUnit && delay !== null && (
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={delay}
                min={1}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onChange({ [delayField]: Number(e.target.value) })
                }
                disabled={!enabled}
                className="w-20 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none disabled:opacity-50 transition"
              />
              <span className="text-xs text-slate-500">
                {DELAY_UNIT_LABELS[delayUnit]}
              </span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => onChange({ [enabledField]: !enabled })}
        className="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 focus:outline-none"
        style={{ backgroundColor: enabled ? '#4F46E5' : '#CBD5E1' }}
        aria-label={enabled ? 'تعطيل' : 'تفعيل'}
      >
        <span
          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
          style={{ transform: enabled ? 'translateX(2px)' : 'translateX(20px)' }}
        />
      </button>
    </div>
  );
}
