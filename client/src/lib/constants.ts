/**
 * Global named constants — no magic strings or numbers anywhere in the codebase.
 */

export const SALLA_API_BASE = 'https://api.salla.dev/admin/v2';
export const SALLA_ACCOUNTS_BASE = 'https://accounts.salla.sa/oauth2';

export const TOKEN_REFRESH_BUFFER_HOURS = 24;
export const ABANDONED_CART_DEFAULT_DELAY_MINUTES = 30;
export const UPSELL_DEFAULT_DELAY_DAYS = 7;
export const WINBACK_DEFAULT_DELAY_DAYS = 30;
export const RATING_DEFAULT_DELAY_DAYS = 3;

export const TOKEN_REFRESH_CRON = '0 * * * *';
export const MUTEX_RETRY_DELAY_MS = 2000;

export const SYNC_PAGE_SIZE = 50;
export const SYNC_PAGE_DELAY_MS = 500;
export const PAYMENT_METHOD_COD = 'cash_on_delivery';
