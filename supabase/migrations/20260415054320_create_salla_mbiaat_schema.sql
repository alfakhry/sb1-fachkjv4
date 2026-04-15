/*
  # Create salla-mbiaat full schema

  ## Summary
  Creates all 11 tables required for the salla-mbiaat integration platform connecting
  Salla e-commerce merchants with the Mbiaat WhatsApp marketing platform.

  ## New Tables

  1. **merchants** - Salla merchant accounts with OAuth tokens and Mbiaat credentials
  2. **customers** - Customer profiles synced from Salla per merchant
  3. **orders** - Order records synced from Salla with attribution tracking
  4. **order_items** - Line items for each order
  5. **smart_profiles** - Computed customer analytics (RFM, segments, preferences)
  6. **abandoned_carts** - Abandoned cart recovery tracking
  7. **sequences_config** - Per-merchant WhatsApp automation sequence configuration
  8. **audience_lists** - Segmented audience lists for campaigns
  9. **audience_filters** - Filter rules for audience lists
  10. **automation_log** - Audit log for all automation events
  11. **campaign_attribution** - Revenue attribution to WhatsApp campaigns

  ## Security
  - RLS enabled on all tables
  - All policies restricted to service role (backend-only access pattern)
*/

-- ─────────────────────────────────────────
-- 1. merchants
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS merchants (
  id                     SERIAL PRIMARY KEY,
  salla_merchant_id      TEXT NOT NULL UNIQUE,
  store_name             TEXT,
  store_url              TEXT,
  access_token           TEXT NOT NULL,
  refresh_token          TEXT NOT NULL,
  token_expires_at       TIMESTAMPTZ NOT NULL,
  mbiaat_user_id         TEXT,
  mbiaat_api_token       TEXT,
  mbiaat_phone_number_id TEXT,
  is_active              BOOLEAN NOT NULL DEFAULT true,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on merchants"
  ON merchants FOR SELECT TO service_role USING (true);

CREATE POLICY "Service role insert on merchants"
  ON merchants FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role update on merchants"
  ON merchants FOR UPDATE TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role delete on merchants"
  ON merchants FOR DELETE TO service_role USING (true);

-- ─────────────────────────────────────────
-- 2. customers
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id                   SERIAL PRIMARY KEY,
  merchant_id          INT NOT NULL REFERENCES merchants(id),
  salla_customer_id    TEXT NOT NULL,
  name                 TEXT,
  phone                TEXT,
  email                TEXT,
  mobile_code          TEXT,
  city                 TEXT,
  country              TEXT,
  gender               TEXT,
  customer_group       TEXT,
  first_seen_at        TIMESTAMPTZ,
  last_order_at        TIMESTAMPTZ,
  mbiaat_subscriber_id TEXT,
  synced_to_mbiaat     BOOLEAN NOT NULL DEFAULT false,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (merchant_id, salla_customer_id)
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on customers"
  ON customers FOR SELECT TO service_role USING (true);

CREATE POLICY "Service role insert on customers"
  ON customers FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role update on customers"
  ON customers FOR UPDATE TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role delete on customers"
  ON customers FOR DELETE TO service_role USING (true);

-- ─────────────────────────────────────────
-- 3. orders
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                  SERIAL PRIMARY KEY,
  merchant_id         INT NOT NULL REFERENCES merchants(id),
  customer_id         INT REFERENCES customers(id),
  salla_order_id      TEXT NOT NULL,
  reference_id        TEXT,
  status_slug         TEXT,
  source              TEXT,
  source_device       TEXT,
  payment_method      TEXT,
  total_amount        NUMERIC,
  subtotal_amount     NUMERIC,
  shipping_amount     NUMERIC,
  tax_amount          NUMERIC,
  shipping_city       TEXT,
  shipping_address    TEXT,
  tracking_number     TEXT,
  url_customer        TEXT,
  url_rating          TEXT,
  from_whatsapp       BOOLEAN NOT NULL DEFAULT false,
  campaign_label      TEXT,
  attributed_sequence TEXT,
  salla_created_at    TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (merchant_id, salla_order_id)
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on orders"
  ON orders FOR SELECT TO service_role USING (true);

CREATE POLICY "Service role insert on orders"
  ON orders FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role update on orders"
  ON orders FOR UPDATE TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role delete on orders"
  ON orders FOR DELETE TO service_role USING (true);

-- ─────────────────────────────────────────
-- 4. order_items
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id                SERIAL PRIMARY KEY,
  order_id          INT NOT NULL REFERENCES orders(id),
  merchant_id       INT NOT NULL REFERENCES merchants(id),
  customer_id       INT REFERENCES customers(id),
  product_id        TEXT,
  product_name      TEXT,
  sku               TEXT,
  category_id       TEXT,
  category_name     TEXT,
  quantity          INT,
  unit_price        NUMERIC,
  total_price       NUMERIC,
  product_image_url TEXT,
  options           JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on order_items"
  ON order_items FOR SELECT TO service_role USING (true);

CREATE POLICY "Service role insert on order_items"
  ON order_items FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role update on order_items"
  ON order_items FOR UPDATE TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role delete on order_items"
  ON order_items FOR DELETE TO service_role USING (true);

-- ─────────────────────────────────────────
-- 5. smart_profiles
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS smart_profiles (
  id                     SERIAL PRIMARY KEY,
  merchant_id            INT NOT NULL REFERENCES merchants(id),
  customer_id            INT NOT NULL UNIQUE REFERENCES customers(id),
  total_orders           INT NOT NULL DEFAULT 0,
  total_spent            NUMERIC NOT NULL DEFAULT 0,
  avg_order_value        NUMERIC NOT NULL DEFAULT 0,
  highest_order_value    NUMERIC NOT NULL DEFAULT 0,
  first_order_date       TIMESTAMPTZ,
  last_order_date        TIMESTAMPTZ,
  days_since_last_order  INT,
  cod_orders_count       INT NOT NULL DEFAULT 0,
  prepaid_orders_count   INT NOT NULL DEFAULT 0,
  payment_preference     TEXT,
  top_category_name      TEXT,
  categories_bought      JSONB,
  products_bought        JSONB,
  cart_abandon_count     INT NOT NULL DEFAULT 0,
  last_abandoned_value   NUMERIC,
  orders_from_whatsapp   INT NOT NULL DEFAULT 0,
  whatsapp_revenue       NUMERIC NOT NULL DEFAULT 0,
  segment                TEXT NOT NULL DEFAULT 'NEW',
  segment_updated_at     TIMESTAMPTZ,
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE smart_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on smart_profiles"
  ON smart_profiles FOR SELECT TO service_role USING (true);

CREATE POLICY "Service role insert on smart_profiles"
  ON smart_profiles FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role update on smart_profiles"
  ON smart_profiles FOR UPDATE TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role delete on smart_profiles"
  ON smart_profiles FOR DELETE TO service_role USING (true);

-- ─────────────────────────────────────────
-- 6. abandoned_carts
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS abandoned_carts (
  id                            SERIAL PRIMARY KEY,
  merchant_id                   INT NOT NULL REFERENCES merchants(id),
  customer_id                   INT REFERENCES customers(id),
  salla_cart_id                 TEXT,
  items                         JSONB,
  total_value                   NUMERIC,
  cart_link                     TEXT,
  status                        TEXT NOT NULL DEFAULT 'pending',
  recovery_sequence_started_at  TIMESTAMPTZ,
  recovered_at                  TIMESTAMPTZ,
  messages_sent                 INT NOT NULL DEFAULT 0,
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on abandoned_carts"
  ON abandoned_carts FOR SELECT TO service_role USING (true);

CREATE POLICY "Service role insert on abandoned_carts"
  ON abandoned_carts FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role update on abandoned_carts"
  ON abandoned_carts FOR UPDATE TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role delete on abandoned_carts"
  ON abandoned_carts FOR DELETE TO service_role USING (true);

-- ─────────────────────────────────────────
-- 7. sequences_config
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sequences_config (
  id                           SERIAL PRIMARY KEY,
  merchant_id                  INT NOT NULL UNIQUE REFERENCES merchants(id),
  abandoned_cart_sequence_id   TEXT,
  abandoned_cart_delay_minutes INT NOT NULL DEFAULT 30,
  order_confirm_sequence_id    TEXT,
  cod_convert_sequence_id      TEXT,
  welcome_sequence_id          TEXT,
  shipping_update_sequence_id  TEXT,
  upsell_sequence_id           TEXT,
  upsell_delay_days            INT NOT NULL DEFAULT 7,
  winback_sequence_id          TEXT,
  winback_delay_days           INT NOT NULL DEFAULT 30,
  rating_sequence_id           TEXT,
  rating_delay_days            INT NOT NULL DEFAULT 3,
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE sequences_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on sequences_config"
  ON sequences_config FOR SELECT TO service_role USING (true);

CREATE POLICY "Service role insert on sequences_config"
  ON sequences_config FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role update on sequences_config"
  ON sequences_config FOR UPDATE TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role delete on sequences_config"
  ON sequences_config FOR DELETE TO service_role USING (true);

-- ─────────────────────────────────────────
-- 8. audience_lists
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audience_lists (
  id                INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  merchant_id       INT NOT NULL REFERENCES merchants(id),
  name              TEXT NOT NULL,
  description       TEXT,
  mbiaat_label_id   TEXT,
  mbiaat_label_name TEXT,
  total_matched     INT NOT NULL DEFAULT 0,
  last_synced_at    TIMESTAMPTZ,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE audience_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on audience_lists"
  ON audience_lists FOR SELECT TO service_role USING (true);

CREATE POLICY "Service role insert on audience_lists"
  ON audience_lists FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role update on audience_lists"
  ON audience_lists FOR UPDATE TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role delete on audience_lists"
  ON audience_lists FOR DELETE TO service_role USING (true);

-- ─────────────────────────────────────────
-- 9. audience_filters
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audience_filters (
  id              SERIAL PRIMARY KEY,
  list_id         INT NOT NULL REFERENCES audience_lists(id),
  filter_type     TEXT NOT NULL,
  filter_field    TEXT NOT NULL,
  filter_operator TEXT NOT NULL,
  filter_value    TEXT,
  filter_value_2  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE audience_filters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on audience_filters"
  ON audience_filters FOR SELECT TO service_role USING (true);

CREATE POLICY "Service role insert on audience_filters"
  ON audience_filters FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role update on audience_filters"
  ON audience_filters FOR UPDATE TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role delete on audience_filters"
  ON audience_filters FOR DELETE TO service_role USING (true);

-- ─────────────────────────────────────────
-- 10. automation_log
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS automation_log (
  id            SERIAL PRIMARY KEY,
  merchant_id   INT NOT NULL REFERENCES merchants(id),
  customer_id   INT REFERENCES customers(id),
  event_type    TEXT NOT NULL,
  sequence_id   TEXT,
  sequence_name TEXT,
  action        TEXT,
  status        TEXT,
  triggered_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  error_message TEXT
);

ALTER TABLE automation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on automation_log"
  ON automation_log FOR SELECT TO service_role USING (true);

CREATE POLICY "Service role insert on automation_log"
  ON automation_log FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role update on automation_log"
  ON automation_log FOR UPDATE TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role delete on automation_log"
  ON automation_log FOR DELETE TO service_role USING (true);

-- ─────────────────────────────────────────
-- 11. campaign_attribution
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaign_attribution (
  id                    SERIAL PRIMARY KEY,
  merchant_id           INT NOT NULL REFERENCES merchants(id),
  customer_id           INT REFERENCES customers(id),
  order_id              INT REFERENCES orders(id),
  source_sequence       TEXT,
  source_message_number INT,
  order_total           NUMERIC,
  attributed_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE campaign_attribution ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on campaign_attribution"
  ON campaign_attribution FOR SELECT TO service_role USING (true);

CREATE POLICY "Service role insert on campaign_attribution"
  ON campaign_attribution FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role update on campaign_attribution"
  ON campaign_attribution FOR UPDATE TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role delete on campaign_attribution"
  ON campaign_attribution FOR DELETE TO service_role USING (true);

-- ─────────────────────────────────────────
-- Indexes for common query patterns
-- ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_customers_merchant_id ON customers(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_merchant_id ON order_items(merchant_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_merchant_id ON abandoned_carts(merchant_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_status ON abandoned_carts(status);
CREATE INDEX IF NOT EXISTS idx_automation_log_merchant_id ON automation_log(merchant_id);
CREATE INDEX IF NOT EXISTS idx_automation_log_triggered_at ON automation_log(triggered_at);
CREATE INDEX IF NOT EXISTS idx_campaign_attribution_merchant_id ON campaign_attribution(merchant_id);
