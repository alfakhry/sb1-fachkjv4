"use strict";
/**
 * Sync service — pulls historical data from Salla API with pagination.
 * Handles customer sync, order sync, and smart profile computation.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriveSegment = deriveSegment;
exports.syncAllCustomers = syncAllCustomers;
exports.syncAllOrders = syncAllOrders;
exports.buildAllSmartProfiles = buildAllSmartProfiles;
exports.buildSmartProfile = buildSmartProfile;
const axios_1 = __importDefault(require("axios"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const constants_1 = require("../lib/constants");
/**
 * Returns the mode (most frequent element) of a number array.
 * Returns null for empty arrays.
 */
function mode(values) {
    if (values.length === 0)
        return null;
    const freq = {};
    for (const v of values)
        freq[v] = (freq[v] ?? 0) + 1;
    return Number(Object.entries(freq).sort(([, a], [, b]) => b - a)[0][0]);
}
/**
 * Returns the most frequent string element of an array or null.
 */
function modeString(values) {
    if (values.length === 0)
        return null;
    const freq = {};
    for (const v of values)
        freq[v] = (freq[v] ?? 0) + 1;
    return Object.entries(freq).sort(([, a], [, b]) => b - a)[0][0];
}
/**
 * Pauses execution for a given number of milliseconds.
 */
async function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Derives segment slug and display label from profile stats.
 * Exported so daily cron can reuse the same logic.
 */
function deriveSegment(totalOrders, totalSpent, daysSinceLastOrder) {
    if (totalOrders === 0) {
        return { segment: 'PROSPECT', segment_display: 'عميل محتمل' };
    }
    if (totalOrders === 1 && daysSinceLastOrder < 7) {
        return { segment: 'NEW', segment_display: 'عميل جديد' };
    }
    if (totalSpent > 500 || totalOrders > 3) {
        return { segment: 'VIP', segment_display: 'عميل مميز' };
    }
    if (daysSinceLastOrder >= 90) {
        return { segment: 'CHURNED', segment_display: 'عميل مفقود' };
    }
    if (daysSinceLastOrder >= 45) {
        return { segment: 'AT_RISK', segment_display: 'عميل في خطر' };
    }
    return { segment: 'ACTIVE', segment_display: 'عميل نشط' };
}
/**
 * Pulls all customers from Salla API and upserts them into the database.
 * Returns the total number of customers synced.
 */
async function syncAllCustomers(merchant) {
    let page = 1;
    let lastPage = 1;
    let totalSynced = 0;
    do {
        const response = await axios_1.default.get(`${constants_1.SALLA_API_BASE}/customers`, {
            headers: { Authorization: `Bearer ${merchant.access_token}` },
            params: { per_page: constants_1.SYNC_PAGE_SIZE, page },
        });
        const { data: customers, pagination } = response.data;
        lastPage = pagination.lastPage;
        for (const customer of customers) {
            await prisma_1.default.customers.upsert({
                where: {
                    merchant_id_salla_customer_id: {
                        merchant_id: merchant.id,
                        salla_customer_id: String(customer.id),
                    },
                },
                update: {
                    name: customer.name,
                    phone: customer.phone,
                    email: customer.email,
                    mobile_code: customer.mobile_code ?? null,
                    city: customer.city ?? null,
                    country: customer.country ?? null,
                    gender: customer.gender ?? null,
                    customer_group: customer.groups?.[0]?.name ?? null,
                    first_seen_at: customer.created_at ? new Date(customer.created_at) : null,
                    updated_at: new Date(),
                },
                create: {
                    merchant_id: merchant.id,
                    salla_customer_id: String(customer.id),
                    name: customer.name,
                    phone: customer.phone,
                    email: customer.email,
                    mobile_code: customer.mobile_code ?? null,
                    city: customer.city ?? null,
                    country: customer.country ?? null,
                    gender: customer.gender ?? null,
                    customer_group: customer.groups?.[0]?.name ?? null,
                    first_seen_at: customer.created_at ? new Date(customer.created_at) : null,
                    synced_to_mbiaat: false,
                },
            });
            totalSynced++;
        }
        console.log(`[sync] Synced customers page ${page}/${lastPage}`);
        page++;
        if (page <= lastPage) {
            await delay(constants_1.SYNC_PAGE_DELAY_MS);
        }
    } while (page <= lastPage);
    return totalSynced;
}
/**
 * Pulls all orders from Salla API and upserts them (with line items) into the database.
 * Skips orders whose customers are not found in the local DB.
 * Returns the total number of orders synced.
 */
async function syncAllOrders(merchant) {
    let page = 1;
    let lastPage = 1;
    let totalSynced = 0;
    do {
        const response = await axios_1.default.get(`${constants_1.SALLA_API_BASE}/orders`, {
            headers: { Authorization: `Bearer ${merchant.access_token}` },
            params: { per_page: constants_1.SYNC_PAGE_SIZE, page },
        });
        const { data: orders, pagination } = response.data;
        lastPage = pagination.lastPage;
        for (const order of orders) {
            const customer = await prisma_1.default.customers.findFirst({
                where: {
                    merchant_id: merchant.id,
                    salla_customer_id: String(order.customer.id),
                },
                select: { id: true },
            });
            if (!customer) {
                console.warn(`[sync] Skipping order ${order.id} — customer ${order.customer.id} not found`);
                continue;
            }
            const upsertedOrder = await prisma_1.default.orders.upsert({
                where: {
                    merchant_id_salla_order_id: {
                        merchant_id: merchant.id,
                        salla_order_id: String(order.id),
                    },
                },
                update: {
                    customer_id: customer.id,
                    reference_id: order.reference_id ?? null,
                    status_slug: order.status.slug,
                    source: order.source ?? 'storefront',
                    source_device: order.source_device ?? null,
                    payment_method: order.payment_method ?? null,
                    total_amount: order.amounts.total.amount,
                    subtotal_amount: order.amounts.sub_total.amount,
                    shipping_amount: order.amounts.shipping?.amount ?? 0,
                    tax_amount: order.amounts.tax?.amount ?? 0,
                    shipping_city: order.shipping?.city ?? null,
                    shipping_address: order.shipping?.address ?? null,
                    tracking_number: order.shipping?.tracking_number ?? null,
                    url_customer: order.urls?.customer ?? null,
                    url_rating: order.urls?.rating ?? null,
                    salla_created_at: order.created_at ? new Date(order.created_at) : null,
                    updated_at: new Date(),
                },
                create: {
                    merchant_id: merchant.id,
                    customer_id: customer.id,
                    salla_order_id: String(order.id),
                    reference_id: order.reference_id ?? null,
                    status_slug: order.status.slug,
                    source: order.source ?? 'storefront',
                    source_device: order.source_device ?? null,
                    payment_method: order.payment_method ?? null,
                    total_amount: order.amounts.total.amount,
                    subtotal_amount: order.amounts.sub_total.amount,
                    shipping_amount: order.amounts.shipping?.amount ?? 0,
                    tax_amount: order.amounts.tax?.amount ?? 0,
                    shipping_city: order.shipping?.city ?? null,
                    shipping_address: order.shipping?.address ?? null,
                    tracking_number: order.shipping?.tracking_number ?? null,
                    url_customer: order.urls?.customer ?? null,
                    url_rating: order.urls?.rating ?? null,
                    from_whatsapp: false,
                    salla_created_at: order.created_at ? new Date(order.created_at) : null,
                },
                select: { id: true },
            });
            await prisma_1.default.order_items.deleteMany({ where: { order_id: upsertedOrder.id } });
            if (order.items.length > 0) {
                await prisma_1.default.order_items.createMany({
                    data: order.items.map((item) => ({
                        order_id: upsertedOrder.id,
                        merchant_id: merchant.id,
                        customer_id: customer.id,
                        product_id: item.product_id ? String(item.product_id) : null,
                        product_name: item.name ?? null,
                        sku: item.sku ?? null,
                        category_id: item.category?.id ? String(item.category.id) : null,
                        category_name: item.category?.name ?? null,
                        quantity: item.quantity ?? null,
                        unit_price: item.price.amount,
                        total_price: item.total.amount,
                        product_image_url: item.image?.url ?? null,
                        options: (item.options ?? []),
                    })),
                });
            }
            totalSynced++;
        }
        console.log(`[sync] Synced orders page ${page}/${lastPage}`);
        page++;
        if (page <= lastPage) {
            await delay(constants_1.SYNC_PAGE_DELAY_MS);
        }
    } while (page <= lastPage);
    return totalSynced;
}
/**
 * Builds smart profiles for all customers of a given merchant.
 */
async function buildAllSmartProfiles(merchantId) {
    const customers = await prisma_1.default.customers.findMany({
        where: { merchant_id: merchantId },
        select: { id: true },
    });
    for (const customer of customers) {
        try {
            await buildSmartProfile(merchantId, customer.id);
        }
        catch (error) {
            console.error(`[sync] Failed to build smart profile for customer ${customer.id}:`, error);
        }
    }
    console.log(`[sync] Built smart profiles for ${customers.length} customers`);
}
/**
 * Fetches all Salla store categories for a given merchant access token.
 * Returns an empty array on failure (non-blocking).
 */
async function fetchSallaCategories(accessToken) {
    try {
        const response = await axios_1.default.get(`${constants_1.SALLA_API_BASE}/categories`, { headers: { Authorization: `Bearer ${accessToken}` } });
        return (response.data.data ?? []).map((c) => c.name).filter(Boolean);
    }
    catch {
        return [];
    }
}
/**
 * Fetches loyalty points for a customer from Salla API.
 * Returns { points, expiry, found } — silent fail.
 */
async function fetchLoyaltyPoints(accessToken, sallaCustomerId) {
    try {
        const response = await axios_1.default.get(`${constants_1.SALLA_API_BASE}/customers/loyalty/points`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { customer_id: sallaCustomerId },
        });
        const points = response.data.data ?? [];
        const activePoints = points.filter((p) => p.status === 'مؤكدة' && (!p.expiry_date || new Date(p.expiry_date) > new Date()));
        const totalPoints = activePoints.reduce((sum, p) => sum + (p.amount ?? 0), 0);
        const expiryDates = activePoints
            .filter((p) => p.expiry_date)
            .map((p) => new Date(p.expiry_date));
        const expiry = expiryDates.length > 0
            ? new Date(Math.min(...expiryDates.map((d) => d.getTime())))
            : null;
        return { points: totalPoints, expiry, found: true };
    }
    catch {
        return { points: 0, expiry: null, found: false };
    }
}
/**
 * Computes and upserts the full 46-field smart profile for a single customer.
 * Called after initial sync and after every new order event.
 */
async function buildSmartProfile(merchantId, customerId) {
    const merchant = await prisma_1.default.merchants.findUnique({
        where: { id: merchantId },
        select: { access_token: true },
    });
    const customer = await prisma_1.default.customers.findUnique({
        where: { id: customerId },
        select: { salla_customer_id: true },
    });
    const orders = await prisma_1.default.orders.findMany({
        where: {
            merchant_id: merchantId,
            customer_id: customerId,
            NOT: { status_slug: 'cancelled' },
        },
        select: {
            id: true,
            total_amount: true,
            subtotal_amount: true,
            shipping_amount: true,
            payment_method: true,
            from_whatsapp: true,
            shipping_city: true,
            salla_created_at: true,
        },
        orderBy: { salla_created_at: 'asc' },
    });
    const orderItems = await prisma_1.default.order_items.findMany({
        where: { merchant_id: merchantId, customer_id: customerId },
        select: { category_name: true, product_id: true, product_name: true },
    });
    const abandonedCarts = await prisma_1.default.abandoned_carts.findMany({
        where: { merchant_id: merchantId, customer_id: customerId },
        select: { total_value: true },
        orderBy: { created_at: 'desc' },
    });
    // ── BASIC STATS ──
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, o) => sum + Number(o.total_amount ?? 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    const highestOrderValue = orders.reduce((max, o) => Math.max(max, Number(o.total_amount ?? 0)), 0);
    const orderDates = orders
        .filter((o) => o.salla_created_at !== null)
        .map((o) => o.salla_created_at);
    const firstOrderDate = orderDates.length > 0
        ? new Date(Math.min(...orderDates.map((d) => d.getTime())))
        : null;
    const lastOrderDate = orderDates.length > 0
        ? new Date(Math.max(...orderDates.map((d) => d.getTime())))
        : null;
    const daysSinceLastOrder = lastOrderDate
        ? Math.floor((Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
    // ── PAYMENT ANALYSIS ──
    const codOrdersCount = orders.filter((o) => o.payment_method === constants_1.PAYMENT_METHOD_COD).length;
    const prepaidOrdersCount = orders.filter((o) => o.payment_method !== constants_1.PAYMENT_METHOD_COD).length;
    let paymentPreference = 'mixed';
    if (codOrdersCount > prepaidOrdersCount)
        paymentPreference = 'cod';
    else if (prepaidOrdersCount > codOrdersCount)
        paymentPreference = 'prepaid';
    // ── PRODUCT ANALYSIS ──
    const categoryCounts = {};
    for (const item of orderItems) {
        if (item.category_name) {
            categoryCounts[item.category_name] = (categoryCounts[item.category_name] ?? 0) + 1;
        }
    }
    const sortedCategories = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a);
    const topCategoryName = sortedCategories[0]?.[0] ?? null;
    const secondaryCategory = sortedCategories[1]?.[0] ?? null;
    const categoryDiversity = sortedCategories.length;
    const productCounts = {};
    const productNames = {};
    for (const item of orderItems) {
        if (item.product_id) {
            productCounts[item.product_id] = (productCounts[item.product_id] ?? 0) + 1;
            if (item.product_name)
                productNames[item.product_id] = item.product_name;
        }
    }
    const repeatProducts = {};
    for (const [pid, count] of Object.entries(productCounts)) {
        if (count > 1) {
            repeatProducts[pid] = { name: productNames[pid] ?? pid, count };
        }
    }
    const mostReorderedProduct = Object.entries(repeatProducts).sort(([, a], [, b]) => b.count - a.count)[0]?.[0] ?? null;
    const totalUniqueProducts = Object.keys(productCounts).length;
    const reorderRate = totalUniqueProducts > 0 ? Object.keys(repeatProducts).length / totalUniqueProducts : 0;
    const topCategoryProductIds = orderItems
        .filter((i) => i.category_name === topCategoryName && i.product_id)
        .reduce((acc, i) => {
        acc[i.product_id] = (acc[i.product_id] ?? 0) + 1;
        return acc;
    }, {});
    const upsellCandidateProducts = Object.entries(topCategoryProductIds)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([pid]) => pid);
    let neverBoughtCategories = [];
    if (merchant?.access_token) {
        const allCategories = await fetchSallaCategories(merchant.access_token);
        neverBoughtCategories = allCategories.filter((c) => !(c in categoryCounts));
    }
    // ── ABANDONED CART ──
    const cartAbandonCount = abandonedCarts.length;
    const lastAbandonedValue = abandonedCarts[0]?.total_value
        ? Number(abandonedCarts[0].total_value)
        : 0;
    // ── WHATSAPP ──
    const ordersFromWhatsapp = orders.filter((o) => o.from_whatsapp).length;
    const whatsappRevenue = orders
        .filter((o) => o.from_whatsapp)
        .reduce((sum, o) => sum + Number(o.total_amount ?? 0), 0);
    const whatsappResponseRate = totalOrders > 0 ? (ordersFromWhatsapp / totalOrders) * 100 : 0;
    // ── TIME INTELLIGENCE ──
    const orderHours = orderDates.map((d) => d.getHours());
    const preferredPurchaseHour = mode(orderHours);
    let preferredPurchasePeriod = null;
    if (preferredPurchaseHour !== null) {
        if (preferredPurchaseHour >= 0 && preferredPurchaseHour <= 5)
            preferredPurchasePeriod = 'night';
        else if (preferredPurchaseHour >= 6 && preferredPurchaseHour <= 11)
            preferredPurchasePeriod = 'morning';
        else if (preferredPurchaseHour >= 12 && preferredPurchaseHour <= 17)
            preferredPurchasePeriod = 'afternoon';
        else
            preferredPurchasePeriod = 'evening';
    }
    let avgDaysBetweenOrders = 0;
    if (orderDates.length >= 2) {
        const sortedDates = [...orderDates].sort((a, b) => a.getTime() - b.getTime());
        const gaps = [];
        for (let i = 1; i < sortedDates.length; i++) {
            gaps.push((sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24));
        }
        avgDaysBetweenOrders = gaps.reduce((s, g) => s + g, 0) / gaps.length;
    }
    const nextPurchasePredictedDate = avgDaysBetweenOrders > 0 && lastOrderDate
        ? new Date(lastOrderDate.getTime() + avgDaysBetweenOrders * 24 * 60 * 60 * 1000)
        : null;
    const RAMADAN_MONTHS = [2, 3];
    const buysInRamadan = orderDates.some((d) => RAMADAN_MONTHS.includes(d.getMonth()));
    const paydayDays = orderDates.map((d) => d.getDate());
    const paydayCount = paydayDays.filter((day) => day >= 25 || day <= 5).length;
    const buysNearPayday = totalOrders > 0 && paydayCount / totalOrders > 0.5;
    // ── VALUE TREND ──
    const sortedOrdersByDate = [...orders].sort((a, b) => (b.salla_created_at?.getTime() ?? 0) - (a.salla_created_at?.getTime() ?? 0));
    const last3Orders = sortedOrdersByDate.slice(0, 3);
    const last3OrdersAvg = last3Orders.length > 0
        ? last3Orders.reduce((s, o) => s + Number(o.total_amount ?? 0), 0) / last3Orders.length
        : 0;
    let orderValueTrend = 'stable';
    if (totalOrders >= 3) {
        if (last3OrdersAvg > avgOrderValue * 1.1)
            orderValueTrend = 'increasing';
        else if (last3OrdersAvg < avgOrderValue * 0.9)
            orderValueTrend = 'decreasing';
    }
    const customerLifetimeValue = totalSpent;
    let predictedAnnualValue = 0;
    if (avgDaysBetweenOrders > 0) {
        predictedAnnualValue = (365 / avgDaysBetweenOrders) * avgOrderValue;
    }
    else if (totalOrders > 0) {
        predictedAnnualValue = avgOrderValue * 12;
    }
    // ── DISCOUNT BEHAVIOR ──
    const totalDiscountReceived = orders.reduce((sum, o) => {
        const discount = Number(o.subtotal_amount ?? 0) - Number(o.total_amount ?? 0);
        return discount > 0 ? sum + discount : sum;
    }, 0);
    const avgDiscountRate = totalSpent > 0 ? (totalDiscountReceived / totalSpent) * 100 : 0;
    const buysOnlyOnDiscount = avgDiscountRate > 10 && totalOrders > 2;
    // ── SHIPPING ──
    const shippingCities = orders
        .map((o) => o.shipping_city)
        .filter((c) => Boolean(c));
    const preferredShippingCity = modeString(shippingCities);
    const freeShippingOrdersCount = orders.filter((o) => Number(o.shipping_amount ?? 0) === 0).length;
    // ── LOYALTY & WALLET ──
    let loyaltyPoints = 0;
    let loyaltyPointsExpiry = null;
    let hasLoyaltyApp = false;
    if (merchant?.access_token && customer?.salla_customer_id) {
        const loyalty = await fetchLoyaltyPoints(merchant.access_token, customer.salla_customer_id);
        loyaltyPoints = loyalty.points;
        loyaltyPointsExpiry = loyalty.expiry;
        hasLoyaltyApp = loyalty.found;
    }
    // ── SEGMENT ──
    const { segment, segment_display } = deriveSegment(totalOrders, totalSpent, daysSinceLastOrder);
    await prisma_1.default.smart_profiles.upsert({
        where: { customer_id: customerId },
        update: {
            total_orders: totalOrders,
            total_spent: totalSpent,
            avg_order_value: avgOrderValue,
            highest_order_value: highestOrderValue,
            first_order_date: firstOrderDate,
            last_order_date: lastOrderDate,
            days_since_last_order: daysSinceLastOrder,
            cod_orders_count: codOrdersCount,
            prepaid_orders_count: prepaidOrdersCount,
            payment_preference: paymentPreference,
            top_category_name: topCategoryName,
            secondary_category: secondaryCategory,
            categories_bought: categoryCounts,
            products_bought: productCounts,
            category_diversity: categoryDiversity,
            repeat_products: repeatProducts,
            most_reordered_product: mostReorderedProduct,
            reorder_rate: reorderRate,
            never_bought_categories: neverBoughtCategories,
            upsell_candidate_products: upsellCandidateProducts,
            cart_abandon_count: cartAbandonCount,
            last_abandoned_value: lastAbandonedValue,
            orders_from_whatsapp: ordersFromWhatsapp,
            whatsapp_revenue: whatsappRevenue,
            whatsapp_response_rate: whatsappResponseRate,
            preferred_purchase_hour: preferredPurchaseHour,
            preferred_purchase_period: preferredPurchasePeriod,
            avg_days_between_orders: avgDaysBetweenOrders,
            next_purchase_predicted_date: nextPurchasePredictedDate,
            buys_in_ramadan: buysInRamadan,
            buys_near_payday: buysNearPayday,
            order_value_trend: orderValueTrend,
            last_3_orders_avg: last3OrdersAvg,
            predicted_annual_value: predictedAnnualValue,
            customer_lifetime_value: customerLifetimeValue,
            total_discount_received: totalDiscountReceived,
            buys_only_on_discount: buysOnlyOnDiscount,
            avg_discount_rate: avgDiscountRate,
            preferred_shipping_city: preferredShippingCity,
            free_shipping_orders_count: freeShippingOrdersCount,
            loyalty_points: loyaltyPoints,
            loyalty_points_expiry: loyaltyPointsExpiry,
            has_loyalty_app: hasLoyaltyApp,
            segment,
            segment_display,
            segment_updated_at: new Date(),
        },
        create: {
            merchant_id: merchantId,
            customer_id: customerId,
            total_orders: totalOrders,
            total_spent: totalSpent,
            avg_order_value: avgOrderValue,
            highest_order_value: highestOrderValue,
            first_order_date: firstOrderDate,
            last_order_date: lastOrderDate,
            days_since_last_order: daysSinceLastOrder,
            cod_orders_count: codOrdersCount,
            prepaid_orders_count: prepaidOrdersCount,
            payment_preference: paymentPreference,
            top_category_name: topCategoryName,
            secondary_category: secondaryCategory,
            categories_bought: categoryCounts,
            products_bought: productCounts,
            category_diversity: categoryDiversity,
            repeat_products: repeatProducts,
            most_reordered_product: mostReorderedProduct,
            reorder_rate: reorderRate,
            never_bought_categories: neverBoughtCategories,
            upsell_candidate_products: upsellCandidateProducts,
            cart_abandon_count: cartAbandonCount,
            last_abandoned_value: lastAbandonedValue,
            orders_from_whatsapp: ordersFromWhatsapp,
            whatsapp_revenue: whatsappRevenue,
            whatsapp_response_rate: whatsappResponseRate,
            preferred_purchase_hour: preferredPurchaseHour,
            preferred_purchase_period: preferredPurchasePeriod,
            avg_days_between_orders: avgDaysBetweenOrders,
            next_purchase_predicted_date: nextPurchasePredictedDate,
            buys_in_ramadan: buysInRamadan,
            buys_near_payday: buysNearPayday,
            order_value_trend: orderValueTrend,
            last_3_orders_avg: last3OrdersAvg,
            predicted_annual_value: predictedAnnualValue,
            customer_lifetime_value: customerLifetimeValue,
            total_discount_received: totalDiscountReceived,
            buys_only_on_discount: buysOnlyOnDiscount,
            avg_discount_rate: avgDiscountRate,
            preferred_shipping_city: preferredShippingCity,
            free_shipping_orders_count: freeShippingOrdersCount,
            loyalty_points: loyaltyPoints,
            loyalty_points_expiry: loyaltyPointsExpiry,
            has_loyalty_app: hasLoyaltyApp,
            segment,
            segment_display,
            segment_updated_at: new Date(),
        },
    });
}
//# sourceMappingURL=syncService.js.map