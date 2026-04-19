"use strict";
/**
 * Mbiaat API service — merchant account creation, direct login URL, and account info.
 * All external Mbiaat API calls live here.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMerchantAccount = createMerchantAccount;
exports.getDirectLoginUrl = getDirectLoginUrl;
exports.getMerchantInfo = getMerchantInfo;
exports.addToSequence = addToSequence;
exports.addLabel = addLabel;
exports.removeLabel = removeLabel;
exports.createLabel = createLabel;
const crypto_1 = __importDefault(require("crypto"));
const axios_1 = __importDefault(require("axios"));
function getBaseUrl() {
    return process.env.MBIAAT_BASE_URL;
}
function getResellerToken() {
    return process.env.MBIAAT_RESELLER_TOKEN;
}
/**
 * Creates a new Mbiaat account for a Salla merchant.
 * Returns the new user_id and api_token.
 */
async function createMerchantAccount(merchant) {
    const response = await axios_1.default.post(`${getBaseUrl()}/user/create`, {
        apiToken: getResellerToken(),
        name: merchant.store_name ?? `Merchant ${merchant.salla_merchant_id}`,
        email: `merchant_${merchant.salla_merchant_id}@salla-mbiaat.com`,
        password: crypto_1.default.randomBytes(16).toString('hex'),
        package_id: process.env.MBIAAT_DEFAULT_PACKAGE_ID,
    });
    return response.data.data;
}
/**
 * Retrieves a direct login URL for a Mbiaat user by user_id.
 */
async function getDirectLoginUrl(mbiaatUserId) {
    const response = await axios_1.default.post(`${getBaseUrl()}/user/get/direct-login-url`, {
        apiToken: getResellerToken(),
        user_id: mbiaatUserId,
    });
    return response.data.data;
}
/**
 * Fetches Mbiaat account info for a merchant using their API token.
 * Returns full account data including phone_number_id from whatsapp_bots_details[0].
 */
async function getMerchantInfo(apiToken) {
    const response = await axios_1.default.get(`${getBaseUrl()}/user/myInfo`, {
        params: { apiToken },
    });
    return response.data.data;
}
/**
 * Adds a subscriber to a Mbiaat sequence.
 */
async function addToSequence(apiToken, subscriberId, sequenceId) {
    await axios_1.default.post(`${getBaseUrl()}/subscriber/sequence/add`, { apiToken, subscriber_id: subscriberId, sequence_id: sequenceId });
}
/**
 * Adds a label to a Mbiaat subscriber.
 */
async function addLabel(apiToken, subscriberId, labelId) {
    await axios_1.default.post(`${getBaseUrl()}/subscriber/label/add`, { apiToken, subscriber_id: subscriberId, label_id: labelId });
}
/**
 * Removes a label from a Mbiaat subscriber.
 */
async function removeLabel(apiToken, subscriberId, labelId) {
    await axios_1.default.post(`${getBaseUrl()}/subscriber/label/remove`, { apiToken, subscriber_id: subscriberId, label_id: labelId });
}
/**
 * Creates a new label in a Mbiaat account.
 * Returns the new label's ID.
 */
async function createLabel(apiToken, labelName) {
    const response = await axios_1.default.post(`${getBaseUrl()}/label/create`, { apiToken, name: labelName });
    return response.data.data.id;
}
//# sourceMappingURL=mbiaatService.js.map