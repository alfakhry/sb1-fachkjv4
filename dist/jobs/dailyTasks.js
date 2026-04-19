"use strict";
/**
 * Daily cron job — runs every midnight (Asia/Riyadh).
 * Tasks: days_since_last_order update, segment recalculation + Mbiaat label sync,
 * winback trigger, upsell trigger, rating trigger, prospect trigger.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startDailyTasksJob = startDailyTasksJob;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const syncService_1 = require("../services/syncService");
const mbiaatService_1 = require("../services/mbiaatService");
const automationLog_1 = require("../lib/automationLog");
const DAILY_CRON = '0 0 * * *';
/**
 * Updates days_since_last_order for all profiles with a known last_order_date.
 */
async function updateDaysSinceLastOrder() {
    const profiles = await prisma_1.default.smart_profiles.findMany({
        where: { last_order_date: { not: null } },
        select: { id: true, last_order_date: true },
    });
    let count = 0;
    for (const profile of profiles) {
        const days = Math.floor((Date.now() - profile.last_order_date.getTime()) / (1000 * 60 * 60 * 24));
        await prisma_1.default.smart_profiles.update({
            where: { id: profile.id },
            data: { days_since_last_order: days },
        });
        count++;
    }
    console.log(`[daily] Updated days_since_last_order for ${count} profiles`);
    return count;
}
/**
 * Recalculates segments for all profiles and syncs changed labels to Mbiaat.
 */
async function recalculateSegments() {
    const merchants = await prisma_1.default.merchants.findMany({
        where: { is_active: true },
        select: { id: true, mbiaat_api_token: true },
    });
    let changes = 0;
    for (const merchant of merchants) {
        const profiles = await prisma_1.default.smart_profiles.findMany({
            where: { merchant_id: merchant.id },
            select: {
                id: true,
                customer_id: true,
                total_orders: true,
                total_spent: true,
                days_since_last_order: true,
                segment: true,
                segment_display: true,
            },
        });
        for (const profile of profiles) {
            const { segment, segment_display } = (0, syncService_1.deriveSegment)(profile.total_orders, Number(profile.total_spent), profile.days_since_last_order ?? 0);
            if (segment !== profile.segment) {
                const oldSegment = profile.segment;
                await prisma_1.default.smart_profiles.update({
                    where: { id: profile.id },
                    data: { segment, segment_display, segment_updated_at: new Date() },
                });
                changes++;
                if (merchant.mbiaat_api_token) {
                    const customer = await prisma_1.default.customers.findUnique({
                        where: { id: profile.customer_id },
                        select: { mbiaat_subscriber_id: true },
                    });
                    if (customer?.mbiaat_subscriber_id) {
                        try {
                            const oldLists = await prisma_1.default.audience_lists.findMany({
                                where: { merchant_id: merchant.id, mbiaat_label_name: oldSegment },
                                select: { mbiaat_label_id: true },
                            });
                            for (const list of oldLists) {
                                if (list.mbiaat_label_id) {
                                    await (0, mbiaatService_1.removeLabel)(merchant.mbiaat_api_token, customer.mbiaat_subscriber_id, list.mbiaat_label_id);
                                }
                            }
                            const newLists = await prisma_1.default.audience_lists.findMany({
                                where: { merchant_id: merchant.id, mbiaat_label_name: segment },
                                select: { mbiaat_label_id: true },
                            });
                            for (const list of newLists) {
                                if (list.mbiaat_label_id) {
                                    await (0, mbiaatService_1.addLabel)(merchant.mbiaat_api_token, customer.mbiaat_subscriber_id, list.mbiaat_label_id);
                                }
                            }
                        }
                        catch (err) {
                            console.error(`[daily] Failed to sync segment label for customer ${profile.customer_id}:`, err);
                        }
                    }
                }
            }
        }
    }
    console.log(`[daily] Recalculated segments: ${changes} changed`);
    return changes;
}
/**
 * Triggers winback sequences for AT_RISK customers at the configured day threshold.
 */
async function triggerWinback() {
    const merchants = await prisma_1.default.merchants.findMany({
        where: { is_active: true },
        select: { id: true, mbiaat_api_token: true, sequences_config: true },
    });
    let count = 0;
    for (const merchant of merchants) {
        const config = merchant.sequences_config;
        if (!config?.winback_sequence_id || !merchant.mbiaat_api_token)
            continue;
        const profiles = await prisma_1.default.smart_profiles.findMany({
            where: {
                merchant_id: merchant.id,
                segment: 'AT_RISK',
                days_since_last_order: config.winback_delay_days,
            },
            select: { customer_id: true },
        });
        for (const profile of profiles) {
            const customer = await prisma_1.default.customers.findUnique({
                where: { id: profile.customer_id },
                select: { mbiaat_subscriber_id: true },
            });
            if (!customer?.mbiaat_subscriber_id)
                continue;
            const alreadyTriggered = await prisma_1.default.automation_log.findFirst({
                where: {
                    merchant_id: merchant.id,
                    customer_id: profile.customer_id,
                    event_type: 'daily.winback',
                    sequence_id: config.winback_sequence_id,
                    triggered_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                },
            });
            if (alreadyTriggered)
                continue;
            try {
                await (0, mbiaatService_1.addToSequence)(merchant.mbiaat_api_token, customer.mbiaat_subscriber_id, config.winback_sequence_id);
                await (0, automationLog_1.logAutomation)({
                    merchant_id: merchant.id,
                    customer_id: profile.customer_id,
                    event_type: 'daily.winback',
                    sequence_id: config.winback_sequence_id,
                    sequence_name: 'winback',
                    action: 'add_to_sequence',
                    status: 'success',
                });
                count++;
            }
            catch (err) {
                await (0, automationLog_1.logAutomation)({
                    merchant_id: merchant.id,
                    customer_id: profile.customer_id,
                    event_type: 'daily.winback',
                    sequence_id: config.winback_sequence_id,
                    sequence_name: 'winback',
                    action: 'add_to_sequence',
                    status: 'failed',
                    error_message: err instanceof Error ? err.message : String(err),
                });
            }
        }
    }
    console.log(`[daily] Winback triggers: ${count}`);
    return count;
}
/**
 * Triggers upsell sequences for orders completed exactly N days ago.
 */
async function triggerUpsell() {
    const merchants = await prisma_1.default.merchants.findMany({
        where: { is_active: true },
        select: { id: true, mbiaat_api_token: true, sequences_config: true },
    });
    let count = 0;
    for (const merchant of merchants) {
        const config = merchant.sequences_config;
        if (!config?.upsell_sequence_id || !merchant.mbiaat_api_token)
            continue;
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - config.upsell_delay_days);
        const dayStart = new Date(new Date(targetDate).setHours(0, 0, 0, 0));
        const dayEnd = new Date(new Date(targetDate).setHours(23, 59, 59, 999));
        const orders = await prisma_1.default.orders.findMany({
            where: {
                merchant_id: merchant.id,
                status_slug: 'completed',
                salla_created_at: { gte: dayStart, lte: dayEnd },
                customer_id: { not: null },
            },
            select: { customer_id: true },
        });
        for (const order of orders) {
            if (!order.customer_id)
                continue;
            const customer = await prisma_1.default.customers.findUnique({
                where: { id: order.customer_id },
                select: { mbiaat_subscriber_id: true },
            });
            if (!customer?.mbiaat_subscriber_id)
                continue;
            const alreadyTriggered = await prisma_1.default.automation_log.findFirst({
                where: {
                    merchant_id: merchant.id,
                    customer_id: order.customer_id,
                    event_type: 'daily.upsell',
                    sequence_id: config.upsell_sequence_id,
                    triggered_at: { gte: dayStart },
                },
            });
            if (alreadyTriggered)
                continue;
            try {
                await (0, mbiaatService_1.addToSequence)(merchant.mbiaat_api_token, customer.mbiaat_subscriber_id, config.upsell_sequence_id);
                await (0, automationLog_1.logAutomation)({
                    merchant_id: merchant.id,
                    customer_id: order.customer_id,
                    event_type: 'daily.upsell',
                    sequence_id: config.upsell_sequence_id,
                    sequence_name: 'upsell',
                    action: 'add_to_sequence',
                    status: 'success',
                });
                count++;
            }
            catch (err) {
                await (0, automationLog_1.logAutomation)({
                    merchant_id: merchant.id,
                    customer_id: order.customer_id,
                    event_type: 'daily.upsell',
                    sequence_id: config.upsell_sequence_id,
                    sequence_name: 'upsell',
                    action: 'add_to_sequence',
                    status: 'failed',
                    error_message: err instanceof Error ? err.message : String(err),
                });
            }
        }
    }
    console.log(`[daily] Upsell triggers: ${count}`);
    return count;
}
/**
 * Triggers rating sequences for orders completed exactly N days ago.
 */
async function triggerRating() {
    const merchants = await prisma_1.default.merchants.findMany({
        where: { is_active: true },
        select: { id: true, mbiaat_api_token: true, sequences_config: true },
    });
    let count = 0;
    for (const merchant of merchants) {
        const config = merchant.sequences_config;
        if (!config?.rating_sequence_id || !merchant.mbiaat_api_token)
            continue;
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - config.rating_delay_days);
        const dayStart = new Date(new Date(targetDate).setHours(0, 0, 0, 0));
        const dayEnd = new Date(new Date(targetDate).setHours(23, 59, 59, 999));
        const orders = await prisma_1.default.orders.findMany({
            where: {
                merchant_id: merchant.id,
                status_slug: 'completed',
                salla_created_at: { gte: dayStart, lte: dayEnd },
                customer_id: { not: null },
            },
            select: { customer_id: true },
        });
        for (const order of orders) {
            if (!order.customer_id)
                continue;
            const customer = await prisma_1.default.customers.findUnique({
                where: { id: order.customer_id },
                select: { mbiaat_subscriber_id: true },
            });
            if (!customer?.mbiaat_subscriber_id)
                continue;
            const alreadyTriggered = await prisma_1.default.automation_log.findFirst({
                where: {
                    merchant_id: merchant.id,
                    customer_id: order.customer_id,
                    event_type: 'daily.rating',
                    sequence_id: config.rating_sequence_id,
                    triggered_at: { gte: dayStart },
                },
            });
            if (alreadyTriggered)
                continue;
            try {
                await (0, mbiaatService_1.addToSequence)(merchant.mbiaat_api_token, customer.mbiaat_subscriber_id, config.rating_sequence_id);
                await (0, automationLog_1.logAutomation)({
                    merchant_id: merchant.id,
                    customer_id: order.customer_id,
                    event_type: 'daily.rating',
                    sequence_id: config.rating_sequence_id,
                    sequence_name: 'rating',
                    action: 'add_to_sequence',
                    status: 'success',
                });
                count++;
            }
            catch (err) {
                await (0, automationLog_1.logAutomation)({
                    merchant_id: merchant.id,
                    customer_id: order.customer_id,
                    event_type: 'daily.rating',
                    sequence_id: config.rating_sequence_id,
                    sequence_name: 'rating',
                    action: 'add_to_sequence',
                    status: 'failed',
                    error_message: err instanceof Error ? err.message : String(err),
                });
            }
        }
    }
    console.log(`[daily] Rating triggers: ${count}`);
    return count;
}
/**
 * Triggers prospect sequences for customers who signed up ~24h ago with 0 orders.
 */
async function triggerProspect() {
    const merchants = await prisma_1.default.merchants.findMany({
        where: { is_active: true },
        select: { id: true, mbiaat_api_token: true, sequences_config: true },
    });
    let count = 0;
    for (const merchant of merchants) {
        const config = merchant.sequences_config;
        if (!config?.prospect_sequence_id || !merchant.mbiaat_api_token)
            continue;
        const delayHours = config.prospect_delay_hours;
        const cutoffStart = new Date(Date.now() - (delayHours + 1) * 60 * 60 * 1000);
        const cutoffEnd = new Date(Date.now() - delayHours * 60 * 60 * 1000);
        const customers = await prisma_1.default.customers.findMany({
            where: {
                merchant_id: merchant.id,
                created_at: { gte: cutoffStart, lte: cutoffEnd },
                mbiaat_subscriber_id: { not: null },
            },
            select: { id: true, mbiaat_subscriber_id: true },
        });
        for (const customer of customers) {
            const profile = await prisma_1.default.smart_profiles.findUnique({
                where: { customer_id: customer.id },
                select: { total_orders: true },
            });
            if ((profile?.total_orders ?? 0) > 0)
                continue;
            const alreadyTriggered = await prisma_1.default.automation_log.findFirst({
                where: {
                    merchant_id: merchant.id,
                    customer_id: customer.id,
                    event_type: 'daily.prospect',
                    sequence_id: config.prospect_sequence_id,
                },
            });
            if (alreadyTriggered)
                continue;
            try {
                await (0, mbiaatService_1.addToSequence)(merchant.mbiaat_api_token, customer.mbiaat_subscriber_id, config.prospect_sequence_id);
                await (0, automationLog_1.logAutomation)({
                    merchant_id: merchant.id,
                    customer_id: customer.id,
                    event_type: 'daily.prospect',
                    sequence_id: config.prospect_sequence_id,
                    sequence_name: 'prospect',
                    action: 'add_to_sequence',
                    status: 'success',
                });
                count++;
            }
            catch (err) {
                await (0, automationLog_1.logAutomation)({
                    merchant_id: merchant.id,
                    customer_id: customer.id,
                    event_type: 'daily.prospect',
                    sequence_id: config.prospect_sequence_id,
                    sequence_name: 'prospect',
                    action: 'add_to_sequence',
                    status: 'failed',
                    error_message: err instanceof Error ? err.message : String(err),
                });
            }
        }
    }
    console.log(`[daily] Prospect triggers: ${count}`);
    return count;
}
/**
 * Runs all daily tasks sequentially and logs a completion summary.
 */
async function runDailyTasks() {
    console.log('[daily] Starting daily tasks...');
    try {
        await updateDaysSinceLastOrder();
        const segments = await recalculateSegments();
        const winback = await triggerWinback();
        const upsell = await triggerUpsell();
        const rating = await triggerRating();
        const prospect = await triggerProspect();
        console.log(`[daily] Tasks completed: segments=${segments} winback=${winback} upsell=${upsell} rating=${rating} prospect=${prospect}`);
    }
    catch (err) {
        console.error('[daily] Unhandled error in daily tasks:', err);
    }
}
/**
 * Registers and starts the daily midnight cron job.
 */
function startDailyTasksJob() {
    node_cron_1.default.schedule(DAILY_CRON, runDailyTasks, { timezone: 'Asia/Riyadh' });
    console.log('[server] Daily tasks cron scheduled');
}
//# sourceMappingURL=dailyTasks.js.map