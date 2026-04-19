/**
 * Customers page — full Audience Builder (قوائم الجمهور).
 * Three-layer audience system: preset templates, quick filters, advanced filters.
 * Right panel: live preview + save. Bottom: saved lists table.
 */

import { useEffect, useState, useCallback } from 'react';
import apiClient from '../api/client';
import {
  AudienceFilter,
  PresetTemplate,
  PreviewResult,
  AudienceList,
} from '../types/audience';
import TemplateCards from '../components/audience/TemplateCards';
import QuickFilters from '../components/audience/QuickFilters';
import AdvancedFilters from '../components/audience/AdvancedFilters';
import PreviewPanel from '../components/audience/PreviewPanel';
import SavedLists from '../components/audience/SavedLists';

const MERCHANT_ID = 1;

export default function Customers() {
  const [templates, setTemplates] = useState<PresetTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);

  const [quickSegment, setQuickSegment] = useState('');
  const [quickPayment, setQuickPayment] = useState('');
  const [quickCity, setQuickCity] = useState('');
  const [quickCategory, setQuickCategory] = useState('');

  const [advancedFilters, setAdvancedFilters] = useState<AudienceFilter[]>([]);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [savedLists, setSavedLists] = useState<AudienceList[]>([]);
  const [listsLoading, setListsLoading] = useState(true);

  const [saveListName, setSaveListName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  useEffect(() => {
    async function loadTemplates() {
      try {
        setTemplatesLoading(true);
        const res = await apiClient.get<{ success: boolean; data: PresetTemplate[] }>(
          `/audience/templates?merchant_id=${MERCHANT_ID}`
        );
        if (res.data.success) setTemplates(res.data.data);
      } catch {
        // silent
      } finally {
        setTemplatesLoading(false);
      }
    }
    loadTemplates();
  }, []);

  const loadSavedLists = useCallback(async () => {
    try {
      setListsLoading(true);
      const res = await apiClient.get<{ success: boolean; data: AudienceList[] }>(
        `/audience/lists/${MERCHANT_ID}`
      );
      if (res.data.success) setSavedLists(res.data.data);
    } catch {
      // silent
    } finally {
      setListsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSavedLists();
  }, [loadSavedLists]);

  function buildFilters(): AudienceFilter[] {
    const filters: AudienceFilter[] = [];
    if (quickSegment) filters.push({ field: 'segment', operator: 'equals', value: quickSegment, type: 'INCLUDE' });
    if (quickPayment) filters.push({ field: 'payment_preference', operator: 'equals', value: quickPayment, type: 'INCLUDE' });
    if (quickCity) filters.push({ field: 'city', operator: 'contains', value: quickCity, type: 'INCLUDE' });
    if (quickCategory) filters.push({ field: 'top_category_name', operator: 'contains', value: quickCategory, type: 'INCLUDE' });
    filters.push(...advancedFilters);
    return filters;
  }

  async function handlePreview() {
    const filters = buildFilters();
    if (filters.length === 0) return;
    try {
      setPreviewLoading(true);
      setPreviewError(null);
      const res = await apiClient.post<{ success: boolean; data: PreviewResult }>('/audience/preview', {
        merchant_id: MERCHANT_ID,
        filters,
      });
      if (res.data.success) setPreview(res.data.data);
      else setPreviewError('فشلت المعاينة');
    } catch {
      setPreviewError('تعذّر الاتصال بالخادم');
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleSave() {
    if (!saveListName.trim()) return;
    const filters = buildFilters();
    try {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(false);
      const res = await apiClient.post<{ success: boolean }>('/audience/save', {
        merchant_id: MERCHANT_ID,
        name: saveListName.trim(),
        filters,
      });
      if (res.data.success) {
        setSaveSuccess(true);
        setSaveListName('');
        await loadSavedLists();
      } else {
        setSaveError('فشل الحفظ');
      }
    } catch {
      setSaveError('تعذّر الاتصال بالخادم');
    } finally {
      setSaving(false);
    }
  }

  async function handleSync(listId: number) {
    try {
      setSyncingId(listId);
      setSyncResult(null);
      const res = await apiClient.post<{ success: boolean; data: { synced_count: number } }>(
        `/audience/sync/${listId}`,
        { merchant_id: MERCHANT_ID }
      );
      if (res.data.success) {
        setSyncResult(`تمت المزامنة: ${res.data.data.synced_count} عميل`);
        await loadSavedLists();
      }
    } catch {
      setSyncResult('فشلت المزامنة');
    } finally {
      setSyncingId(null);
    }
  }

  function applyTemplate(template: PresetTemplate) {
    setAdvancedFilters([]);
    setQuickSegment('');
    setQuickPayment('');
    setQuickCity('');
    setQuickCategory('');
    const segmentFilter = template.filters.find((f) => f.field === 'segment');
    if (segmentFilter) setQuickSegment(String(segmentFilter.value));
    const paymentFilter = template.filters.find((f) => f.field === 'payment_preference');
    if (paymentFilter) setQuickPayment(String(paymentFilter.value));
    const restFilters = template.filters.filter(
      (f) => f.field !== 'segment' && f.field !== 'payment_preference'
    );
    if (restFilters.length > 0) {
      setAdvancedOpen(true);
      setAdvancedFilters(restFilters.map((f) => ({ ...f, type: f.type ?? 'INCLUDE' })));
    }
    setSaveListName(template.name);
  }

  return (
    <div className="p-8 min-h-screen" dir="rtl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">قوائم الجمهور</h2>
        <p className="text-slate-500 text-sm mt-1">بناء قوائم مستهدفة ومزامنتها مع مبيعات</p>
      </div>

      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0 space-y-6">
          <TemplateCards
            templates={templates}
            loading={templatesLoading}
            onSelect={applyTemplate}
          />

          <QuickFilters
            segment={quickSegment}
            payment={quickPayment}
            city={quickCity}
            category={quickCategory}
            onSegmentChange={setQuickSegment}
            onPaymentChange={setQuickPayment}
            onCityChange={setQuickCity}
            onCategoryChange={setQuickCategory}
            onPreview={handlePreview}
            previewLoading={previewLoading}
          />

          <AdvancedFilters
            open={advancedOpen}
            onToggle={() => setAdvancedOpen((v: boolean) => !v)}
            filters={advancedFilters}
            onFiltersChange={setAdvancedFilters}
          />
        </div>

        <div className="w-80 flex-shrink-0">
          <PreviewPanel
            preview={preview}
            loading={previewLoading}
            error={previewError}
            listName={saveListName}
            onListNameChange={setSaveListName}
            onSave={handleSave}
            saving={saving}
            saveError={saveError}
            saveSuccess={saveSuccess}
            syncingId={syncingId}
            syncResult={syncResult}
            onSync={handleSync}
            savedLists={savedLists}
          />
        </div>
      </div>

      <div className="mt-8">
        <SavedLists
          lists={savedLists}
          loading={listsLoading}
          syncingId={syncingId}
          onSync={handleSync}
        />
      </div>

      {syncResult && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-sm px-5 py-3 rounded-xl shadow-lg z-50 animate-fade-in">
          {syncResult}
        </div>
      )}
    </div>
  );
}
