/**
 * Handler for the Salla 'app.store.authorize' webhook event.
 * Upserts the merchant, fetches store info, creates a Mbiaat account, and activates the merchant.
 * Each step is isolated — one failure does not stop subsequent steps.
 */
import { SallaWebhookPayload } from '../types';
/**
 * Processes the app.store.authorize event asynchronously after the 200 response is sent.
 */
export declare function appStoreAuthorize(payload: SallaWebhookPayload): Promise<void>;
//# sourceMappingURL=appStoreAuthorize.d.ts.map