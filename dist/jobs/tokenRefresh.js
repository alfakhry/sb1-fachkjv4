"use strict";
/**
 * Cron job — refreshes Salla OAuth tokens that are expiring within the next 24 hours.
 * Runs every hour. Safe to fail silently on individual merchant errors.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startTokenRefreshJob = startTokenRefreshJob;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const sallaService_1 = require("../services/sallaService");
const constants_1 = require("../lib/constants");
/**
 * Finds merchants with expiring tokens and refreshes them.
 */
async function runTokenRefresh() {
    console.log('[tokenRefresh] Starting token refresh run');
    const bufferMs = constants_1.TOKEN_REFRESH_BUFFER_HOURS * 60 * 60 * 1000;
    const threshold = new Date(Date.now() + bufferMs);
    let successCount = 0;
    let failureCount = 0;
    try {
        const merchants = await prisma_1.default.merchants.findMany({
            where: {
                token_expires_at: { lt: threshold },
                is_active: true,
            },
            select: {
                id: true,
                refresh_token: true,
                salla_merchant_id: true,
            },
        });
        console.log(`[tokenRefresh] Found ${merchants.length} merchant(s) needing token refresh`);
        for (const merchant of merchants) {
            try {
                await (0, sallaService_1.refreshToken)(merchant.id, merchant.refresh_token);
                successCount++;
            }
            catch {
                failureCount++;
            }
        }
    }
    catch (error) {
        console.error('[tokenRefresh] Failed to query merchants:', error);
        return;
    }
    console.log(`[tokenRefresh] Done — success: ${successCount}, failed: ${failureCount}`);
}
/**
 * Starts the hourly token refresh cron job.
 */
function startTokenRefreshJob() {
    node_cron_1.default.schedule(constants_1.TOKEN_REFRESH_CRON, () => {
        runTokenRefresh().catch((error) => {
            console.error('[tokenRefresh] Unexpected error in cron run:', error);
        });
    });
    console.log('[tokenRefresh] Cron job scheduled:', constants_1.TOKEN_REFRESH_CRON);
}
//# sourceMappingURL=tokenRefresh.js.map