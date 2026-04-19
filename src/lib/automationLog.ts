/**
 * Automation log utility — writes audit entries to the automation_log table.
 * Centralises all logAutomation() calls from cron jobs and event handlers.
 */

import prisma from './prisma';

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
export async function logAutomation(entry: AutomationLogEntry): Promise<void> {
  try {
    await prisma.automation_log.create({
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
  } catch (err) {
    console.error('[automationLog] Failed to write log entry:', err);
  }
}
