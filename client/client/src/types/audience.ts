/**
 * Audience Builder types — shared interfaces for the audience list system.
 */

export interface AudienceFilter {
  field: string;
  operator: string;
  value: unknown;
  value2?: unknown;
  type: 'INCLUDE' | 'EXCLUDE';
}

export interface PresetTemplate {
  id: string;
  name: string;
  icon: string;
  filters: AudienceFilter[];
  count: number | null;
}

export interface PreviewSample {
  id: number;
  name: string | null;
  phone: string | null;
  segment: string;
}

export interface PreviewResult {
  count: number;
  sample: PreviewSample[];
}

export interface AudienceList {
  id: number;
  name: string;
  total_matched: number | null;
  last_synced_at: string | null;
  created_at: string;
  mbiaat_label_id: string | null;
}

export const SEGMENT_OPTIONS = [
  { value: 'PROSPECT', label: 'محتمل' },
  { value: 'NEW', label: 'جديد' },
  { value: 'ACTIVE', label: 'نشط' },
  { value: 'VIP', label: 'VIP' },
  { value: 'AT_RISK', label: 'في خطر' },
  { value: 'CHURNED', label: 'مفقود' },
];

export const PAYMENT_OPTIONS = [
  { value: 'cod', label: 'الدفع عند الاستلام' },
  { value: 'prepaid', label: 'دفع مسبق' },
  { value: 'mixed', label: 'مختلط' },
];

export const SEGMENT_COLORS: Record<string, string> = {
  VIP: 'bg-amber-100 text-amber-800',
  NEW: 'bg-blue-100 text-blue-800',
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  AT_RISK: 'bg-red-100 text-red-800',
  CHURNED: 'bg-slate-200 text-slate-700',
  PROSPECT: 'bg-sky-100 text-sky-800',
  UNKNOWN: 'bg-slate-100 text-slate-600',
};

export const ADVANCED_FIELDS = [
  { value: 'segment', label: 'الشريحة' },
  { value: 'total_orders', label: 'إجمالي الطلبات' },
  { value: 'total_spent', label: 'إجمالي الإنفاق' },
  { value: 'days_since_last_order', label: 'أيام بدون شراء' },
  { value: 'payment_preference', label: 'تفضيل الدفع' },
  { value: 'top_category_name', label: 'الفئة المفضلة' },
  { value: 'cart_abandon_count', label: 'عدد السلال المهجورة' },
  { value: 'whatsapp_response_rate', label: 'نسبة استجابة واتساب' },
  { value: 'buys_only_on_discount', label: 'محب للعروض' },
  { value: 'buys_in_ramadan', label: 'مشتري رمضان' },
];

export const OPERATORS = [
  { value: 'equals', label: 'يساوي' },
  { value: 'greater_than', label: 'أكبر من' },
  { value: 'less_than', label: 'أصغر من' },
  { value: 'contains', label: 'يحتوي على' },
  { value: 'between', label: 'بين' },
];
