"use strict";
/**
 * Automation log utility — writes audit entries to the automation_log table.
 * Centralises all logAutomation() calls from cron jobs and event handlers.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAutomation = logAutomation;
const prisma_1 = __importDefault(require("./prisma"));
/**
 * Inserts a single automation log entry into the database.
 * Silently ignores write failures to avoid disrupting the calling flow.
 */
async function logAutomation(entry) {
    try {
        await prisma_1.default.automation_log.create({
            data: {
                merchant_id: entry.merchant_id,
                customer_id: entry.customer_id ?? null,
                event_type: entry.event_type,
                sequence_id: entry.sequence_id ?? null,
                sequence_name: entry.sequence_name ?? null,
                action: entry.action ?? null,
                status: entry.status ?? null,
                error_message: entry.error_message ?? null,
            },
        });
    }
    catch (err) {
        console.error('[automationLog] Failed to write log entry:', err);
    }
}
//# sourceMappingURL=automationLog.js.map