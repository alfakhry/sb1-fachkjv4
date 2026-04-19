/**
 * Audience service — three-layer audience list system.
 * Layer 1: Preset templates (12 pre-built audience definitions)
 * Layer 2: Quick filters (4 simple field filters)
 * Layer 3: Advanced filters (full smart_profile + customer + order fields)
 */
export interface AudienceFilter {
    field: string;
    operator: string;
    value: unknown;
    value2?: unknown;
    type?: 'INCLUDE' | 'EXCLUDE';
}
export interface PresetTemplate {
    id: string;
    name: string;
    icon: string;
    filters: AudienceFilter[];
}
export interface AudiencePreviewResult {
    count: number;
    sample: Array<{
        id: number;
        name: string | null;
        phone: string | null;
        segment: string;
    }>;
}
export declare const PRESET_TEMPLATES: PresetTemplate[];
/**
 * Runs a filtered audience query and returns matching customer IDs.
 */
export declare function buildAudienceQuery(merchantId: number, filters: AudienceFilter[]): Promise<number[]>;
/**
 * Previews an audience — returns count and a sample of 5 customers.
 */
export declare function previewAudience(merchantId: number, filters: AudienceFilter[]): Promise<AudiencePreviewResult>;
/**
 * Saves an audience list with filters to the database and creates a Mbiaat label.
 */
export declare function saveAudienceList(merchantId: number, name: string, filters: AudienceFilter[], merchantApiToken: string | null): Promise<{
    id: number;
    name: string;
    mbiaat_label_id: string | null;
}>;
/**
 * Syncs all matching customers in an audience list to a Mbiaat label.
 */
export declare function syncAudienceToMbiaat(merchantId: number, listId: number): Promise<{
    synced_count: number;
}>;
/**
 * Returns all saved audience lists for a merchant.
 */
export declare function getAudienceListsForMerchant(merchantId: number): Promise<({
    audience_filters: {
        id: number;
        created_at: Date;
        filter_type: string;
        filter_field: string;
        filter_operator: string;
        filter_value: string | null;
        filter_value_2: string | null;
        list_id: number;
    }[];
} & {
    name: string;
    id: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    merchant_id: number;
    description: string | null;
    mbiaat_label_id: string | null;
    mbiaat_label_name: string | null;
    total_matched: number;
    last_synced_at: Date | null;
})[]>;
//# sourceMappingURL=audienceService.d.ts.map