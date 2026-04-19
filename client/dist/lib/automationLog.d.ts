/**
 * Automation log utility — writes audit entries to the automation_log table.
 * Centralises all logAutomation() calls from cron jobs and event handlers.
 */
export interface AutomationLogEntry {
    merchant_id: number;
    customer_id?: number | null;
    event_type: string;
    sequence_id?: string | null;
    sequence_name?: string | null;
    action?: string | null;
    status?: string | null;
    error_message?: string | null;
}
/**
 * Inserts a single automation log entry into the database.
 * Silently ignores write failures to avoid disrupting the calling flow.
 */
export declare function logAutomation(entry: AutomationLogEntry): Promise<void>;
//# sourceMappingURL=automationLog.d.ts.map