/*
  # Expand smart_profiles to full 46-field model + add prospect fields to sequences_config

  ## Changes

  ### smart_profiles — 26 new columns added
  Adding all analytics fields that syncService.ts computes but were missing from the schema:
  - secondary_category: second most purchased category
  - category_diversity: count of distinct categories purchased
  - repeat_products: JSON map of products ordered more than once
  - most_reordered_product: product ID with highest reorder count
  - reorder_rate: ratio of repeat products to total unique products
  - never_bought_categories: JSON array of store categories never purchased
  - upsell_candidate_products: JSON array of top 5 product IDs in top category
  - whatsapp_response_rate: percentage of orders placed after WhatsApp messages
  - preferred_purchase_hour: modal hour of day for purchases (0-23)
  - preferred_purchase_period: night / morning / afternoon / evening
  - avg_days_between_orders: average gap between consecutive orders
  - next_purchase_predicted_date: predicted next order date
  - buys_in_ramadan: flag for purchases during Ramadan months
  - buys_near_payday: flag for purchases near month-end/start paydays
  - order_value_trend: increasing / stable / decreasing
  - last_3_orders_avg: average order value of the 3 most recent orders
  - predicted_annual_value: projected annual spend based on order cadence
  - customer_lifetime_value: total spend to date
  - total_discount_received: total SAR value of discounts received
  - buys_only_on_discount: flag for customers who primarily buy on discount
  - avg_discount_rate: average discount percentage received
  - preferred_shipping_city: most common shipping destination
  - free_shipping_orders_count: number of orders with zero shipping cost
  - loyalty_points: total active loyalty points
  - loyalty_points_expiry: soonest expiry date for active points
  - has_loyalty_app: flag indicating loyalty data was found
  - segment_display: human-readable Arabic segment label

  ### sequences_config — 2 new columns added
  - prospect_sequence_id: Mbiaat sequence to trigger for new sign-ups with 0 orders
  - prospect_delay_hours: hours after sign-up before prospect sequence fires (default 24)

  ## Security
  No RLS changes — existing policies on both tables remain in effect.
*/

-- ── smart_profiles: new columns ─────────────────────────────────────────────

ALTER TABLE smart_profiles
  ADD COLUMN IF NOT EXISTS secondary_category          text,
  ADD COLUMN IF NOT EXISTS category_diversity          integer         NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS repeat_products             jsonb,
  ADD COLUMN IF NOT EXISTS most_reordered_product      text,
  ADD COLUMN IF NOT EXISTS reorder_rate                numeric         NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS never_bought_categories     jsonb,
  ADD COLUMN IF NOT EXISTS upsell_candidate_products   jsonb,
  ADD COLUMN IF NOT EXISTS whatsapp_response_rate      numeric         NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS preferred_purchase_hour     integer,
  ADD COLUMN IF NOT EXISTS preferred_purchase_period   text,
  ADD COLUMN IF NOT EXISTS avg_days_between_orders     numeric         NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_purchase_predicted_date timestamptz,
  ADD COLUMN IF NOT EXISTS buys_in_ramadan             boolean         NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS buys_near_payday            boolean         NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS order_value_trend           text            NOT NULL DEFAULT 'stable',
  ADD COLUMN IF NOT EXISTS last_3_orders_avg           numeric         NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS predicted_annual_value      numeric         NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS customer_lifetime_value     numeric         NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_discount_received     numeric         NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS buys_only_on_discount       boolean         NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS avg_discount_rate           numeric         NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS preferred_shipping_city     text,
  ADD COLUMN IF NOT EXISTS free_shipping_orders_count  integer         NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS loyalty_points              integer         NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS loyalty_points_expiry       timestamptz,
  ADD COLUMN IF NOT EXISTS has_loyalty_app             boolean         NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS segment_display             text            NOT NULL DEFAULT '';

-- ── sequences_config: prospect fields ───────────────────────────────────────

ALTER TABLE sequences_config
  ADD COLUMN IF NOT EXISTS prospect_sequence_id  text,
  ADD COLUMN IF NOT EXISTS prospect_delay_hours  integer NOT NULL DEFAULT 24;
