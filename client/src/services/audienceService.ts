/**
 * Audience service — three-layer audience list system.
 * Layer 1: Preset templates (12 pre-built audience definitions)
 * Layer 2: Quick filters (4 simple field filters)
 * Layer 3: Advanced filters (full smart_profile + customer + order fields)
 */

import prisma from '../lib/prisma';
import { createLabel, addLabel } from './mbiaatService';

export interface AudienceFilter {
  field: string;
  operator: string;
  value: unknown;
  value2?: unknown;
  type?: 'INCLUDE' | 'EXCLUDE';
}

export interface PresetTemplate {
  id: string;
  name: string;
  icon: string;
  filters: AudienceFilter[];
}

export interface AudiencePreviewResult {
  count: number;
  sample: Array<{ id: number; name: string | null; phone: string | null; segment: string }>;
}

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: 'vip_customers',
    name: 'عملاء VIP',
    icon: '🏆',
    filters: [{ field: 'segment', operator: 'equals', value: 'VIP' }],
  },
  {
    id: 'new_customers',
    name: 'عملاء جدد',
    icon: '🆕',
    filters: [{ field: 'segment', operator: 'equals', value: 'NEW' }],
  },
  {
    id: 'at_risk',
    name: 'عملاء في خطر',
    icon: '⚠️',
    filters: [{ field: 'segment', operator: 'equals', value: 'AT_RISK' }],
  },
  {
    id: 'abandoned_carts',
    name: 'سلال مهجورة',
    icon: '🛒',
    filters: [{ field: 'cart_abandon_count', operator: 'greater_than', value: 0 }],
  },
  {
    id: 'cod_customers',
    name: 'عملاء COD',
    icon: '💳',
    filters: [{ field: 'payment_preference', operator: 'equals', value: 'cod' }],
  },
  {
    id: 'upsell_candidates',
    name: 'مرشحون للـ Upsell',
    icon: '🎯',
    filters: [{ field: 'days_since_last_order', operator: 'between', value: 5, value2: 9 }],
  },
  {
    id: 'churned',
    name: 'عملاء مفقودون',
    icon: '😴',
    filters: [{ field: 'segment', operator: 'equals', value: 'CHURNED' }],
  },
  {
    id: 'discount_lovers',
    name: 'محبو العروض',
    icon: '🎪',
    filters: [{ field: 'buys_only_on_discount', operator: 'equals', value: true }],
  },
  {
    id: 'prospects',
    name: 'عملاء محتملون',
    icon: '👀',
    filters: [{ field: 'segment', operator: 'equals', value: 'PROSPECT' }],
  },
  {
    id: 'ramadan_buyers',
    name: 'مشتري رمضان',
    icon: '🌙',
    filters: [{ field: 'buys_in_ramadan', operator: 'equals', value: true }],
  },
  {
    id: 'loyalty_expiring',
    name: 'نقاط على وشك الانتهاء',
    icon: '⏰',
    filters: [
      { field: 'loyalty_points', operator: 'greater_than', value: 0 },
      { field: 'loyalty_points_expiry', operator: 'less_than', value: '30_days' },
    ],
  },
  {
    id: 'whatsapp_responsive',
    name: 'مستجيبون للواتساب',
    icon: '📱',
    filters: [{ field: 'whatsapp_response_rate', operator: 'greater_than', value: 30 }],
  },
];

const SMART_PROFILE_FIELDS = new Set([
  'segment', 'payment_preference', 'total_orders', 'total_spent', 'avg_order_value',
  'days_since_last_order', 'top_category_name', 'secondary_category', 'cart_abandon_count',
  'orders_from_whatsapp', 'whatsapp_response_rate', 'buys_only_on_discount', 'buys_in_ramadan',
  'buys_near_payday', 'loyalty_points', 'loyalty_points_expiry', 'order_value_trend',
  'preferred_purchase_period', 'reorder_rate', 'category_diversity', 'predicted_annual_value',
  'highest_order_value', 'last_3_orders_avg', 'most_reordered_product',
]);

const CUSTOMER_FIELDS = new Set(['city', 'gender', 'customer_group']);

/**
 * Builds a Prisma WHERE clause snippet for a smart_profile-level filter.
 */
function buildProfileCondition(f: AudienceFilter): object | null {
  const { field, operator, value, value2 } = f;

  if (field === 'loyalty_points_expiry' && value === '30_days') {
    const cutoff = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return { smart_profile: { [field]: { lte: cutoff } } };
  }

  let condition: unknown;
  switch (operator) {
    case 'equals':
      condition = value;
      break;
    case 'greater_than':
      condition = { gt: value };
      break;
    case 'less_than':
      condition = { lt: value };
      break;
    case 'between':
      condition = { gte: value, lte: value2 };
      break;
    case 'contains':
      condition = { contains: value, mode: 'insensitive' };
      break;
    case 'in':
      condition = { in: Array.isArray(value) ? value : [value] };
      break;
    default:
      return null;
  }

  return { smart_profile: { [field]: condition } };
}

/**
 * Builds a Prisma WHERE clause snippet for a customer-level filter.
 */
function buildCustomerCondition(f: AudienceFilter): object | null {
  const { field, operator, value, value2 } = f;

  let condition: unknown;
  switch (operator) {
    case 'equals':
      condition = value;
      break;
    case 'contains':
      condition = { contains: value, mode: 'insensitive' };
      break;
    case 'in':
      condition = { in: Array.isArray(value) ? value : [value] };
      break;
    case 'between':
      condition = { gte: value, lte: value2 };
      break;
    default:
      return null;
  }

  return { [field]: condition };
}

/**
 * Runs a filtered audience query and returns matching customer IDs.
 */
export async function buildAudienceQuery(
  merchantId: number,
  filters: AudienceFilter[]
): Promise<number[]> {
  const includeFilters = filters.filter((f) => f.type !== 'EXCLUDE');
  const excludeFilters = filters.filter((f) => f.type === 'EXCLUDE');

  const profileInclude: object[] = [];
  const customerInclude: object[] = [];
  const profileExclude: object[] = [];
  const customerExclude: object[] = [];

  for (const f of includeFilters) {
    if (SMART_PROFILE_FIELDS.has(f.field)) {
      const cond = buildProfileCondition(f);
      if (cond) profileInclude.push(cond);
    } else if (CUSTOMER_FIELDS.has(f.field)) {
      const cond = buildCustomerCondition(f);
      if (cond) customerInclude.push(cond);
    }
  }

  for (const f of excludeFilters) {
    if (SMART_PROFILE_FIELDS.has(f.field)) {
      const cond = buildProfileCondition(f);
      if (cond) profileExclude.push(cond);
    } else if (CUSTOMER_FIELDS.has(f.field)) {
      const cond = buildCustomerCondition(f);
      if (cond) customerExclude.push(cond);
    }
  }

  const where: Record<string, unknown> = { merchant_id: merchantId };

  if (profileInclude.length > 0) {
    const merged = profileInclude.reduce<Record<string, unknown>>((acc, c) => {
      const entry = c as Record<string, unknown>;
      const profile = (entry['smart_profile'] ?? {}) as Record<string, unknown>;
      const existing = (acc['smart_profile'] ?? {}) as Record<string, unknown>;
      acc['smart_profile'] = { ...existing, ...profile };
      return acc;
    }, {});
    Object.assign(where, merged);
  }

  if (customerInclude.length > 0) {
    const merged = customerInclude.reduce<Record<string, unknown>>(
      (acc, c) => ({ ...acc, ...c }),
      {}
    );
    Object.assign(where, merged);
  }

  if (profileExclude.length > 0 || customerExclude.length > 0) {
    const notClauses: object[] = [];
    for (const c of profileExclude) notClauses.push(c);
    for (const c of customerExclude) notClauses.push(c);
    where['NOT'] = notClauses;
  }

  const customers = await (
    prisma.customers.findMany as (args: unknown) => Promise<Array<{ id: number }>>
  )({
    where,
    select: { id: true },
  });

  return customers.map((c) => c.id);
}

/**
 * Previews an audience — returns count and a sample of 5 customers.
 */
export async function previewAudience(
  merchantId: number,
  filters: AudienceFilter[]
): Promise<AudiencePreviewResult> {
  const ids = await buildAudienceQuery(merchantId, filters);

  const sample = await prisma.customers.findMany({
    where: { id: { in: ids.slice(0, 5) } },
    select: {
      id: true,
      name: true,
      phone: true,
      smart_profile: { select: { segment: true } },
    },
  });

  return {
    count: ids.length,
    sample: sample.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      segment: c.smart_profile?.segment ?? 'UNKNOWN',
    })),
  };
}

/**
 * Saves an audience list with filters to the database and creates a Mbiaat label.
 */
export async function saveAudienceList(
  merchantId: number,
  name: string,
  filters: AudienceFilter[],
  merchantApiToken: string | null
): Promise<{ id: number; name: string; mbiaat_label_id: string | null }> {
  let mbiaatLabelId: string | null = null;

  if (merchantApiToken) {
    try {
      mbiaatLabelId = await createLabel(merchantApiToken, name);
    } catch (err) {
      console.error('[audienceService] Failed to create Mbiaat label:', err);
    }
  }

  const list = await prisma.audience_lists.create({
    data: {
      merchant_id: merchantId,
      name,
      mbiaat_label_id: mbiaatLabelId,
      mbiaat_label_name: name,
      audience_filters: {
        create: filters.map((f) => ({
          filter_type: f.type ?? 'INCLUDE',
          filter_field: f.field,
          filter_operator: f.operator,
          filter_value: f.value !== undefined ? String(f.value) : null,
          filter_value_2: f.value2 !== undefined ? String(f.value2) : null,
        })),
      },
    },
    select: { id: true, name: true, mbiaat_label_id: true },
  });

  return list;
}

/**
 * Syncs all matching customers in an audience list to a Mbiaat label.
 */
export async function syncAudienceToMbiaat(
  merchantId: number,
  listId: number
): Promise<{ synced_count: number }> {
  const list = await prisma.audience_lists.findFirst({
    where: { id: listId, merchant_id: merchantId },
    include: { audience_filters: true },
  });

  if (!list) throw new Error(`Audience list ${listId} not found`);
  if (!list.mbiaat_label_id) throw new Error(`Audience list ${listId} has no Mbiaat label`);

  const merchant = await prisma.merchants.findUnique({
    where: { id: merchantId },
    select: { mbiaat_api_token: true },
  });

  if (!merchant?.mbiaat_api_token) throw new Error(`Merchant ${merchantId} has no Mbiaat API token`);

  const filters: AudienceFilter[] = list.audience_filters.map((f) => ({
    field: f.filter_field,
    operator: f.filter_operator,
    value: f.filter_value,
    value2: f.filter_value_2 ?? undefined,
    type: f.filter_type as 'INCLUDE' | 'EXCLUDE',
  }));

  const customerIds = await buildAudienceQuery(merchantId, filters);

  const customers = await prisma.customers.findMany({
    where: { id: { in: customerIds }, mbiaat_subscriber_id: { not: null } },
    select: { mbiaat_subscriber_id: true },
  });

  let syncedCount = 0;
  for (const customer of customers) {
    try {
      await addLabel(merchant.mbiaat_api_token, customer.mbiaat_subscriber_id!, list.mbiaat_label_id);
      syncedCount++;
    } catch (err) {
      console.error(
        `[audienceService] Failed to add label for subscriber ${customer.mbiaat_subscriber_id}:`,
        err
      );
    }
  }

  await prisma.audience_lists.update({
    where: { id: listId },
    data: { total_matched: customerIds.length, last_synced_at: new Date(), updated_at: new Date() },
  });

  return { synced_count: syncedCount };
}

/**
 * Returns all saved audience lists for a merchant.
 */
export async function getAudienceListsForMerchant(merchantId: number) {
  return prisma.audience_lists.findMany({
    where: { merchant_id: merchantId, is_active: true },
    include: { audience_filters: true },
    orderBy: { created_at: 'desc' },
  });
}
