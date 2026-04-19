/**
 * Mbiaat API service — merchant account creation, direct login URL, and account info.
 * All external Mbiaat API calls live here.
 */
import { MbiaatCreateUserResponse, MbiaatDirectLoginResponse, MbiaatUserInfo } from '../types';
/**
 * Creates a new Mbiaat account for a Salla merchant.
 * Returns the new user_id and api_token.
 */
export declare function createMerchantAccount(merchant: {
    salla_merchant_id: string;
    store_name: string | null;
}): Promise<MbiaatCreateUserResponse>;
/**
 * Retrieves a direct login URL for a Mbiaat user by user_id.
 */
export declare function getDirectLoginUrl(mbiaatUserId: string): Promise<MbiaatDirectLoginResponse>;
/**
 * Fetches Mbiaat account info for a merchant using their API token.
 * Returns full account data including phone_number_id from whatsapp_bots_details[0].
 */
export declare function getMerchantInfo(apiToken: string): Promise<MbiaatUserInfo>;
/**
 * Adds a subscriber to a Mbiaat sequence.
 */
export declare function addToSequence(apiToken: string, subscriberId: string, sequenceId: string): Promise<void>;
/**
 * Adds a label to a Mbiaat subscriber.
 */
export declare function addLabel(apiToken: string, subscriberId: string, labelId: string): Promise<void>;
/**
 * Removes a label from a Mbiaat subscriber.
 */
export declare function removeLabel(apiToken: string, subscriberId: string, labelId: string): Promise<void>;
/**
 * Creates a new label in a Mbiaat account.
 * Returns the new label's ID.
 */
export declare function createLabel(apiToken: string, labelName: string): Promise<string>;
//# sourceMappingURL=mbiaatService.d.ts.map