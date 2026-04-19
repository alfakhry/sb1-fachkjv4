/**
 * Sequences Manager types — shared interfaces for automation sequences page.
 */

export interface SequencesConfig {
  id: number;
  merchant_id: number;
  welcome_sequence_id: string | null;
  welcome_enabled: boolean;
  order_confirm_sequence_id: string | null;
  order_confirm_enabled: boolean;
  cod_convert_sequence_id: string | null;
  cod_convert_enabled: boolean;
  abandoned_cart_sequence_id: string | null;
  abandoned_cart_delay_minutes: number;
  abandoned_cart_enabled: boolean;
  shipping_update_sequence_id: string | null;
  shipping_update_enabled: boolean;
  rating_sequence_id: string | null;
  rating_delay_days: number;
  rating_enabled: boolean;
  upsell_sequence_id: string | null;
  upsell_delay_days: number;
  upsell_enabled: boolean;
  winback_sequence_id: string | null;
  winback_delay_days: number;
  winback_enabled: boolean;
  prospect_sequence_id: string | null;
  prospect_delay_hours: number;
  prospect_enabled: boolean;
}

export interface AutomationLogEntry {
  id: number;
  event_type: string;
  sequence_id: string | null;
  sequence_name: string | null;
  status: string | null;
  triggered_at: string;
  error_message: string | null;
  customer: { name: string | null; phone: string | null } | null;
}

export interface AutomationStats {
  total: number;
  success: number;
  failed: number;
  skipped: number;
  successRate: number;
}

export interface SequenceDefinition {
  label: string;
  icon: string;
  idField: keyof SequencesConfig;
  enabledField: keyof SequencesConfig;
  delayField?: keyof SequencesConfig;
  delayUnit?: 'minutes' | 'hours' | 'days';
  defaultDelay?: number;
}

export const SEQUENCE_DEFINITIONS: SequenceDefinition[] = [
  {
    label: 'ترحيب بالعميل الجديد',
    icon: '👋',
    idField: 'welcome_sequence_id',
    enabledField: 'welcome_enabled',
  },
  {
    label: 'تأكيد الطلب',
    icon: '✅',
    idField: 'order_confirm_sequence_id',
    enabledField: 'order_confirm_enabled',
  },
  {
    label: 'تحويل COD',
    icon: '💳',
    idField: 'cod_convert_sequence_id',
    enabledField: 'cod_convert_enabled',
  },
  {
    label: 'استرداد السلة المهجورة',
    icon: '🛒',
    idField: 'abandoned_cart_sequence_id',
    enabledField: 'abandoned_cart_enabled',
    delayField: 'abandoned_cart_delay_minutes',
    delayUnit: 'minutes',
    defaultDelay: 30,
  },
  {
    label: 'تحديث الشحن',
    icon: '🚚',
    idField: 'shipping_update_sequence_id',
    enabledField: 'shipping_update_enabled',
  },
  {
    label: 'طلب التقييم',
    icon: '⭐',
    idField: 'rating_sequence_id',
    enabledField: 'rating_enabled',
    delayField: 'rating_delay_days',
    delayUnit: 'days',
    defaultDelay: 3,
  },
  {
    label: 'Upsell',
    icon: '📈',
    idField: 'upsell_sequence_id',
    enabledField: 'upsell_enabled',
    delayField: 'upsell_delay_days',
    delayUnit: 'days',
    defaultDelay: 7,
  },
  {
    label: 'استعادة العملاء',
    icon: '🔄',
    idField: 'winback_sequence_id',
    enabledField: 'winback_enabled',
    delayField: 'winback_delay_days',
    delayUnit: 'days',
    defaultDelay: 30,
  },
  {
    label: 'العميل المحتمل',
    icon: '🎯',
    idField: 'prospect_sequence_id',
    enabledField: 'prospect_enabled',
    delayField: 'prospect_delay_hours',
    delayUnit: 'hours',
    defaultDelay: 24,
  },
];

export const DELAY_UNIT_LABELS: Record<string, string> = {
  minutes: 'دقيقة',
  hours: 'ساعة',
  days: 'يوم',
};

export const STATUS_STYLES: Record<string, string> = {
  success: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
  skipped: 'bg-slate-100 text-slate-600',
};

export const STATUS_LABELS: Record<string, string> = {
  success: 'نجح',
  failed: 'فشل',
  skipped: 'تجاوز',
};
