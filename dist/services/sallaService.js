"use strict";
/**
 * Salla API service — store info retrieval and OAuth token refresh.
 * All external Salla API calls live here.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStoreInfo = getStoreInfo;
exports.refreshToken = refreshToken;
const axios_1 = __importDefault(require("axios"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const constants_1 = require("../lib/constants");
const refreshMutex = new Map();
/**
 * Fetches basic store info from the Salla API.
 */
async function getStoreInfo(accessToken) {
    const response = await axios_1.default.get(`${constants_1.SALLA_API_BASE}/store/info`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const { name, domain } = response.data.data;
    return { name, domain };
}
/**
 * Refreshes the Salla OAuth token for a merchant.
 * Uses an in-memory mutex to prevent concurrent refreshes for the same merchant.
 * Silently fails on error (cron-safe).
 */
async function refreshToken(merchantId, currentRefreshToken) {
    if (refreshMutex.get(merchantId)) {
        console.log(`[sallaService] Token refresh already in progress for merchant ${merchantId}, retrying after delay`);
        await new Promise((resolve) => setTimeout(resolve, constants_1.MUTEX_RETRY_DELAY_MS));
        if (refreshMutex.get(merchantId)) {
            console.log(`[sallaService] Refresh still locked for merchant ${merchantId}, skipping`);
            return;
        }
    }
    refreshMutex.set(merchantId, true);
    try {
        const params = new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: process.env.SALLA_CLIENT_ID,
            client_secret: process.env.SALLA_CLIENT_SECRET,
            refresh_token: currentRefreshToken,
        });
        const response = await axios_1.default.post(`${constants_1.SALLA_ACCOUNTS_BASE}/token`, params.toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        const { access_token, refresh_token, expires_in } = response.data;
        const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);
        await prisma_1.default.merchants.update({
            where: { id: merchantId },
            data: {
                access_token,
                refresh_token,
                token_expires_at: tokenExpiresAt,
                updated_at: new Date(),
            },
        });
        console.log(`[sallaService] Token refreshed for merchant ${merchantId}`);
    }
    catch (error) {
        console.error(`[sallaService] Failed to refresh token for merchant ${merchantId}:`, error);
    }
    finally {
        refreshMutex.delete(merchantId);
    }
}
//# sourceMappingURL=sallaService.js.map