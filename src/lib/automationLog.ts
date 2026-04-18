/**
 * Utility for writing entries to the automation_log table.
 */

import prisma from './prisma';

interface LogEntry {
  merchant_id: number;
  customer_id?: number | null;
  event_type: string;
  sequence_id?: string | null;
  sequence_name?: string | null;
  action?: string | null;
  status: 'success' | 'failed' | 'skipped';
  error_message?: string | null;
}

/**
 * Inserts a single automation log entry. Never throws — logs internally on failure.
 */
export async function logAutomation(entry: LogEntry): Promise<void> {
  try {
    await prisma.automation_log.create({ data: entry });
  } catch (err) {
    console.error('[automationLog] Failed to write log entry:', err);
  }
}
