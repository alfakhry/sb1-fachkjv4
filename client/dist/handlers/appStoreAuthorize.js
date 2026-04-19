"use strict";
/**
 * Handler for the Salla 'app.store.authorize' webhook event.
 * Upserts the merchant, fetches store info, creates a Mbiaat account, and activates the merchant.
 * Each step is isolated — one failure does not stop subsequent steps.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appStoreAuthorize = appStoreAuthorize;
const prisma_1 = __importDefault(require("../lib/prisma"));
const sallaService_1 = require("../services/sallaService");
const mbiaatService_1 = require("../services/mbiaatService");
/**
 * Processes the app.store.authorize event asynchronously after the 200 response is sent.
 */
async function appStoreAuthorize(payload) {
    const { merchant: sallaMerchantId, data } = payload;
    const accessToken = data.access_token;
    const refreshToken = data.refresh_token;
    const expiresIn = data.expires;
    if (!accessToken || !refreshToken) {
        console.error('[appStoreAuthorize] Missing tokens in payload');
        return;
    }
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
    const merchantIdStr = String(sallaMerchantId);
    // Step 1 — Upsert merchant
    let merchant;
    try {
        merchant = await prisma_1.default.merchants.upsert({
            where: { salla_merchant_id: merchantIdStr },
            update: {
                access_token: accessToken,
                refresh_token: refreshToken,
                token_expires_at: tokenExpiresAt,
                updated_at: new Date(),
            },
            create: {
                salla_merchant_id: merchantIdStr,
                access_token: accessToken,
                refresh_token: refreshToken,
                token_expires_at: tokenExpiresAt,
                is_active: false,
            },
            select: {
                id: true,
                salla_merchant_id: true,
                store_name: true,
                mbiaat_user_id: true,
            },
        });
        console.log(`[appStoreAuthorize] Step 1 complete — merchant upserted, id=${merchant.id}`);
    }
    catch (error) {
        console.error('[appStoreAuthorize] Step 1 failed — upsert merchant:', error);
        return;
    }
    // Step 2 — Fetch store info from Salla
    try {
        const storeInfo = await (0, sallaService_1.getStoreInfo)(accessToken);
        await prisma_1.default.merchants.update({
            where: { id: merchant.id },
            data: {
                store_name: storeInfo.name,
                store_url: storeInfo.domain,
                updated_at: new Date(),
            },
        });
        merchant.store_name = storeInfo.name;
        console.log(`[appStoreAuthorize] Step 2 complete — store info fetched: ${storeInfo.name}`);
    }
    catch (error) {
        console.error('[appStoreAuthorize] Step 2 failed — fetch store info:', error);
    }
    // Step 3 — Create Mbiaat account (only if not already created)
    let mbiaatUserId = merchant.mbiaat_user_id;
    if (!mbiaatUserId) {
        try {
            const mbiaatAccount = await (0, mbiaatService_1.createMerchantAccount)({
                salla_merchant_id: merchant.salla_merchant_id,
                store_name: merchant.store_name,
            });
            await prisma_1.default.merchants.update({
                where: { id: merchant.id },
                data: {
                    mbiaat_user_id: mbiaatAccount.user_id,
                    mbiaat_api_token: mbiaatAccount.api_token,
                    updated_at: new Date(),
                },
            });
            mbiaatUserId = mbiaatAccount.user_id;
            console.log(`[appStoreAuthorize] Step 3 complete — Mbiaat account created, user_id=${mbiaatUserId}`);
        }
        catch (error) {
            console.error('[appStoreAuthorize] Step 3 failed — create Mbiaat account:', error);
        }
    }
    else {
        console.log(`[appStoreAuthorize] Step 3 skipped — Mbiaat account already exists`);
    }
    // Step 4 — Get direct login URL
    if (mbiaatUserId) {
        try {
            const loginData = await (0, mbiaatService_1.getDirectLoginUrl)(mbiaatUserId);
            console.log(`[appStoreAuthorize] Step 4 complete — direct login URL obtained`);
            // login_url is informational; can be stored or delivered via another channel
            void loginData;
        }
        catch (error) {
            console.error('[appStoreAuthorize] Step 4 failed — get direct login URL:', error);
        }
    }
    // Step 5 — Activate merchant
    try {
        await prisma_1.default.merchants.update({
            where: { id: merchant.id },
            data: {
                is_active: true,
                updated_at: new Date(),
            },
        });
        console.log(`[appStoreAuthorize] Step 5 complete — merchant activated, id=${merchant.id}`);
    }
    catch (error) {
        console.error('[appStoreAuthorize] Step 5 failed — activate merchant:', error);
    }
}
//# sourceMappingURL=appStoreAuthorize.js.map