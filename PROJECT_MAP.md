# Salla × Mbiaat — Project Map

## Overview

Integration platform that connects Salla (e-commerce) merchants with Mbiaat (WhatsApp marketing).
When a merchant installs the app on Salla, their account is automatically provisioned in Mbiaat
and linked. Background jobs keep OAuth tokens fresh. Future prompts will add order processing,
abandoned cart recovery, audience segmentation, and WhatsApp automation triggers.

---

## Prompt Progress

| Prompt | Description | Status |
|--------|-------------|--------|
| 1 | Database schema (11 tables) + Express server skeleton | ✅ Complete |
| 2 | Salla webhook receiver + Mbiaat auto-account creation | ✅ Complete |
| 3 | Order sync + customer upsert from webhooks | ⏳ Pending |
| 4 | Abandoned cart detection + recovery sequence trigger | ⏳ Pending |
| 5 | Smart profiles + audience segmentation | ⏳ Pending |

---

## Endpoints

| Method | Path | Purpose | Status |
|--------|------|---------|--------|
| GET | /health | Health check | ✅ |
| POST | /webhook/salla | Receive all Salla webhook events | ✅ |

---

## File Index

| File | Purpose |
|------|---------|
| `src/index.ts` | Entry point — starts server, registers routes, starts cron jobs |
| `src/lib/prisma.ts` | Singleton Prisma client — only DB access point |
| `src/lib/constants.ts` | All magic strings/numbers as named constants |
| `src/types/index.ts` | Shared TypeScript interfaces |
| `src/middleware/webhookVerifier.ts` | Verifies Salla HMAC-SHA256 webhook signatures |
| `src/services/sallaService.ts` | Salla API calls: store info, token refresh |
| `src/services/mbiaatService.ts` | Mbiaat API calls: create account, direct login, account info |
| `src/handlers/appStoreAuthorize.ts` | Handles app.store.authorize event (5-step async flow) |
| `src/routes/webhook.ts` | Express router for /webhook/salla — dispatches events |
| `src/jobs/tokenRefresh.ts` | Hourly cron: refreshes expiring Salla OAuth tokens |
| `prisma/schema.prisma` | Prisma schema for all 11 database models |

---

## Database Tables

| Table | Purpose | Status |
|-------|---------|--------|
| `merchants` | Salla merchant accounts with OAuth + Mbiaat credentials | ✅ |
| `customers` | Customer profiles synced from Salla | ✅ |
| `orders` | Orders from Salla with attribution tracking | ✅ |
| `order_items` | Line items per order | ✅ |
| `smart_profiles` | Computed RFM analytics per customer | ✅ |
| `abandoned_carts` | Abandoned cart recovery tracking | ✅ |
| `sequences_config` | Per-merchant WhatsApp automation configuration | ✅ |
| `audience_lists` | Segmented audience lists for campaigns | ✅ |
| `audience_filters` | Filter rules for audience lists | ✅ |
| `automation_log` | Audit log for all automation events | ✅ |
| `campaign_attribution` | Revenue attribution to WhatsApp campaigns | ✅ |

---

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `PORT` | HTTP server port (default: 3000) | No |
| `SALLA_CLIENT_ID` | Salla OAuth app client ID | Yes |
| `SALLA_CLIENT_SECRET` | Salla OAuth app client secret | Yes |
| `SALLA_WEBHOOK_SECRET` | HMAC secret for webhook signature verification | Yes (prod) |
| `MBIAAT_RESELLER_TOKEN` | Mbiaat reseller API token | Yes |
| `MBIAAT_BASE_URL` | Mbiaat API base URL | Yes |
| `MBIAAT_DEFAULT_PACKAGE_ID` | Default Mbiaat package to assign new merchants | Yes |
| `APP_URL` | Public URL of this service | Yes |
| `WEBHOOK_URL` | Webhook URL registered with Salla | No |

---

## Webhook Event Handlers

| Event | Handler | Status |
|-------|---------|--------|
| `app.store.authorize` | `appStoreAuthorize` | ✅ |
| `order.created` | — | ⏳ Prompt 3 |
| `order.updated` | — | ⏳ Prompt 3 |
| `customer.created` | — | ⏳ Prompt 3 |
| `cart.abandoned` | — | ⏳ Prompt 4 |
