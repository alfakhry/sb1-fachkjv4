/**
 * Shared TypeScript interfaces for Salla webhooks, Mbiaat API responses, and internal types.
 */
export interface SallaWebhookPayload {
    event: string;
    merchant: number;
    created_at: string;
    data: {
        access_token?: string;
        refresh_token?: string;
        expires?: number;
        [key: string]: unknown;
    };
}
export interface SallaStoreInfo {
    name: string;
    domain: string;
}
export interface MbiaatCreateUserResponse {
    user_id: string;
    api_token: string;
}
export interface MbiaatDirectLoginResponse {
    login_url: string;
}
export interface MbiaatUserInfo {
    user_id: string;
    name: string;
    email: string;
    api_token: string;
    whatsapp_bots_details?: Array<{
        phone_number_id: string;
        [key: string]: unknown;
    }>;
    [key: string]: unknown;
}
export interface TokenRefreshResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
}
//# sourceMappingURL=index.d.ts.map