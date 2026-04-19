/*
  # Add enabled flags to sequences_config

  ## Summary
  Adds 9 boolean `*_enabled` columns to the `sequences_config` table — one per
  automation sequence. These let merchants toggle individual sequences on/off
  without clearing the sequence ID.

  ## New Columns (all on sequences_config)
  - welcome_enabled           — Toggle for new-customer welcome sequence
  - order_confirm_enabled     — Toggle for order confirmation sequence
  - cod_convert_enabled       — Toggle for COD conversion sequence
  - abandoned_cart_enabled    — Toggle for abandoned cart recovery sequence
  - shipping_update_enabled   — Toggle for shipping update sequence
  - rating_enabled            — Toggle for post-purchase rating request sequence
  - upsell_enabled            — Toggle for upsell sequence
  - winback_enabled           — Toggle for win-back / churned customer sequence
  - prospect_enabled          — Toggle for prospect nurture sequence

  All default to TRUE so existing rows stay active after migration.

  ## Security
  No RLS changes — sequences_config is accessed only by the backend service role.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sequences_config' AND column_name = 'welcome_enabled'
  ) THEN
    ALTER TABLE sequences_config ADD COLUMN welcome_enabled BOOLEAN NOT NULL DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sequences_config' AND column_name = 'order_confirm_enabled'
  ) THEN
    ALTER TABLE sequences_config ADD COLUMN order_confirm_enabled BOOLEAN NOT NULL DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sequences_config' AND column_name = 'cod_convert_enabled'
  ) THEN
    ALTER TABLE sequences_config ADD COLUMN cod_convert_enabled BOOLEAN NOT NULL DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sequences_config' AND column_name = 'abandoned_cart_enabled'
  ) THEN
    ALTER TABLE sequences_config ADD COLUMN abandoned_cart_enabled BOOLEAN NOT NULL DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sequences_config' AND column_name = 'shipping_update_enabled'
  ) THEN
    ALTER TABLE sequences_config ADD COLUMN shipping_update_enabled BOOLEAN NOT NULL DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sequences_config' AND column_name = 'rating_enabled'
  ) THEN
    ALTER TABLE sequences_config ADD COLUMN rating_enabled BOOLEAN NOT NULL DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sequences_config' AND column_name = 'upsell_enabled'
  ) THEN
    ALTER TABLE sequences_config ADD COLUMN upsell_enabled BOOLEAN NOT NULL DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sequences_config' AND column_name = 'winback_enabled'
  ) THEN
    ALTER TABLE sequences_config ADD COLUMN winback_enabled BOOLEAN NOT NULL DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sequences_config' AND column_name = 'prospect_enabled'
  ) THEN
    ALTER TABLE sequences_config ADD COLUMN prospect_enabled BOOLEAN NOT NULL DEFAULT true;
  END IF;
END $$;
