/**
 * Sync service — pulls historical data from Salla API with pagination.
 * Handles customer sync, order sync, and smart profile computation.
 */
interface MerchantForSync {
    id: number;
    salla_merchant_id: string;
    access_token: string;
}
/**
 * Derives segment slug and display label from profile stats.
 * Exported so daily cron can reuse the same logic.
 */
export declare function deriveSegment(totalOrders: number, totalSpent: number, daysSinceLastOrder: number): {
    segment: string;
    segment_display: string;
};
/**
 * Pulls all customers from Salla API and upserts them into the database.
 * Returns the total number of customers synced.
 */
export declare function syncAllCustomers(merchant: MerchantForSync): Promise<number>;
/**
 * Pulls all orders from Salla API and upserts them (with line items) into the database.
 * Skips orders whose customers are not found in the local DB.
 * Returns the total number of orders synced.
 */
export declare function syncAllOrders(merchant: MerchantForSync): Promise<number>;
/**
 * Builds smart profiles for all customers of a given merchant.
 */
export declare function buildAllSmartProfiles(merchantId: number): Promise<void>;
/**
 * Computes and upserts the full 46-field smart profile for a single customer.
 * Called after initial sync and after every new order event.
 */
export declare function buildSmartProfile(merchantId: number, customerId: number): Promise<void>;
export {};
//# sourceMappingURL=syncService.d.ts.map