/**
 * Sequences page — Automation Manager (إدارة الأتمتة).
 * Section 1: configure 9 automation sequences (toggle + ID + delay).
 * Section 2: automation log table (last 20 entries).
 * Section 3: aggregate stats (total, success, failed, success rate).
 */

import { useEffect, useState, useCallback } from 'react';
import apiClient from '../api/client';
import {
  SequencesConfig,
  AutomationLogEntry,
  AutomationStats,
  SEQUENCE_DEFINITIONS,
} from '../types/sequences';
import SequenceCard from '../components/sequences/SequenceCard';
import AutomationLogTable from '../components/sequences/AutomationLogTable';
import AutomationStatsSection from '../components/sequences/AutomationStats';

const MERCHANT_ID = 1;

const DEFAULT_CONFIG: Omit<SequencesConfig, 'id' | 'merchant_id'> = {
  welcome_sequence_id: null,
  welcome_enabled: true,
  order_confirm_sequence_id: null,
  order_confirm_enabled: true,
  cod_convert_sequence_id: null,
  cod_convert_enabled: true,
  abandoned_cart_sequence_id: null,
  abandoned_cart_delay_minutes: 30,
  abandoned_cart_enabled: true,
  shipping_update_sequence_id: null,
  shipping_update_enabled: true,
  rating_sequence_id: null,
  rating_delay_days: 3,
  rating_enabled: true,
  upsell_sequence_id: null,
  upsell_delay_days: 7,
  upsell_enabled: true,
  winback_sequence_id: null,
  winback_delay_days: 30,
  winback_enabled: true,
  prospect_sequence_id: null,
  prospect_delay_hours: 24,
  prospect_enabled: true,
};

export default function Sequences() {
  const [config, setConfig] = useState<SequencesConfig>({
    id: 0,
    merchant_id: MERCHANT_ID,
    ...DEFAULT_CONFIG,
  });
  const [logs, setLogs] = useState<AutomationLogEntry[]>([]);
  const [stats, setStats] = useState<AutomationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<{
        success: boolean;
        data: {
          config: SequencesConfig | null;
          logs: AutomationLogEntry[];
          stats: AutomationStats;
        };
      }>(`/api/sequences/${MERCHANT_ID}`);
      if (res.data.success) {
        if (res.data.data.config) {
          setConfig(res.data.data.config);
        }
        setLogs(res.data.data.logs);
        setStats(res.data.data.stats);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleChange(patch: Partial<SequencesConfig>) {
    setConfig((prev: SequencesConfig) => ({ ...prev, ...patch }));
  }

  async function handleSave() {
    try {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(false);
      const res = await apiClient.put<{ success: boolean; data: SequencesConfig }>(
        `/api/sequences/${MERCHANT_ID}`,
        config
      );
      if (res.data.success) {
        setConfig(res.data.data);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError('فشل الحفظ');
      }
    } catch {
      setSaveError('تعذّر الاتصال بالخادم');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8 min-h-screen" dir="rtl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">إدارة الأتمتة</h2>
          <p className="text-slate-500 text-sm mt-1">إعداد تسلسلات الرسائل التلقائية ومتابعة الأداء</p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-sm text-emerald-600 font-medium">
              تم الحفظ بنجاح
            </span>
          )}
          {saveError && (
            <span className="text-sm text-red-600">{saveError}</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جارٍ الحفظ...
              </>
            ) : (
              'حفظ الإعدادات'
            )}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-5 bg-primary-500 rounded-full" />
            <h3 className="text-base font-semibold text-slate-800">إعداد التسلسلات</h3>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {SEQUENCE_DEFINITIONS.map((def) => {
                const cardProps = {
                  definition: def,
                  config: config as SequencesConfig,
                  onChange: handleChange,
                };
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                return <SequenceCard key={def.idField} {...cardProps} />;
              })}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-5 bg-amber-400 rounded-full" />
            <h3 className="text-base font-semibold text-slate-800">الإحصائيات</h3>
          </div>
          <AutomationStatsSection stats={stats} loading={loading} />
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-5 bg-emerald-500 rounded-full" />
            <h3 className="text-base font-semibold text-slate-800">سجل الأتمتة</h3>
          </div>
          <AutomationLogTable logs={logs} loading={loading} />
        </section>
      </div>
    </div>
  );
}
