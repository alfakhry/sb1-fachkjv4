"use strict";
/**
 * Global named constants — no magic strings or numbers anywhere in the codebase.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MUTEX_RETRY_DELAY_MS = exports.TOKEN_REFRESH_CRON = exports.RATING_DEFAULT_DELAY_DAYS = exports.WINBACK_DEFAULT_DELAY_DAYS = exports.UPSELL_DEFAULT_DELAY_DAYS = exports.ABANDONED_CART_DEFAULT_DELAY_MINUTES = exports.TOKEN_REFRESH_BUFFER_HOURS = exports.SALLA_ACCOUNTS_BASE = exports.SALLA_API_BASE = void 0;
exports.SALLA_API_BASE = 'https://api.salla.dev/admin/v2';
exports.SALLA_ACCOUNTS_BASE = 'https://accounts.salla.sa/oauth2';
exports.TOKEN_REFRESH_BUFFER_HOURS = 24;
exports.ABANDONED_CART_DEFAULT_DELAY_MINUTES = 30;
exports.UPSELL_DEFAULT_DELAY_DAYS = 7;
exports.WINBACK_DEFAULT_DELAY_DAYS = 30;
exports.RATING_DEFAULT_DELAY_DAYS = 3;
exports.TOKEN_REFRESH_CRON = '0 * * * *';
exports.MUTEX_RETRY_DELAY_MS = 2000;
//# sourceMappingURL=constants.js.map