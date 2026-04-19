/**
 * Salla API service — store info retrieval and OAuth token refresh.
 * All external Salla API calls live here.
 */
import { SallaStoreInfo } from '../types';
/**
 * Fetches basic store info from the Salla API.
 */
export declare function getStoreInfo(accessToken: string): Promise<SallaStoreInfo>;
/**
 * Refreshes the Salla OAuth token for a merchant.
 * Uses an in-memory mutex to prevent concurrent refreshes for the same merchant.
 * Silently fails on error (cron-safe).
 */
export declare function refreshToken(merchantId: number, currentRefreshToken: string): Promise<void>;
//# sourceMappingURL=sallaService.d.ts.map