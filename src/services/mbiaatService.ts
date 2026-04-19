/**
 * Mbiaat API service — merchant account creation, direct login URL, and account info.
 * All external Mbiaat API calls live here.
 */

import crypto from 'crypto';
import axios from 'axios';
import {
  MbiaatCreateUserResponse,
  MbiaatDirectLoginResponse,
  MbiaatUserInfo,
} from '../types';

function getBaseUrl(): string {
  return process.env.MBIAAT_BASE_URL!;
}

function getResellerToken(): string {
  return process.env.MBIAAT_RESELLER_TOKEN!;
}

/**
 * Creates a new Mbiaat account for a Salla merchant.
 * Returns the new user_id and api_token.
 */
export async function createMerchantAccount(merchant: {
  salla_merchant_id: string;
  store_name: string | null;
}): Promise<MbiaatCreateUserResponse> {
  const response = await axios.post<{ data: MbiaatCreateUserResponse }>(
    `${getBaseUrl()}/user/create`,
    {
      apiToken: getResellerToken(),
      name: merchant.store_name ?? `Merchant ${merchant.salla_merchant_id}`,
      email: `merchant_${merchant.salla_merchant_id}@salla-mbiaat.com`,
      password: crypto.randomBytes(16).toString('hex'),
      package_id: process.env.MBIAAT_DEFAULT_PACKAGE_ID,
    }
  );

  return response.data.data;
}

/**
 * Retrieves a direct login URL for a Mbiaat user by user_id.
 */
export async function getDirectLoginUrl(mbiaatUserId: string): Promise<MbiaatDirectLoginResponse> {
  const response = await axios.post<{ data: MbiaatDirectLoginResponse }>(
    `${getBaseUrl()}/user/get/direct-login-url`,
    {
      apiToken: getResellerToken(),
      user_id: mbiaatUserId,
    }
  );

  return response.data.data;
}

/**
 * Fetches Mbiaat account info for a merchant using their API token.
 * Returns full account data including phone_number_id from whatsapp_bots_details[0].
 */
export async function getMerchantInfo(apiToken: string): Promise<MbiaatUserInfo> {
  const response = await axios.get<{ data: MbiaatUserInfo }>(
    `${getBaseUrl()}/user/myInfo`,
    {
      params: { apiToken },
    }
  );

  return response.data.data;
}

/**
 * Adds a subscriber to a Mbiaat sequence.
 */
export async function addToSequence(
  apiToken: string,
  subscriberId: string,
  sequenceId: string
): Promise<void> {
  await axios.post(
    `${getBaseUrl()}/subscriber/sequence/add`,
    { apiToken, subscriber_id: subscriberId, sequence_id: sequenceId }
  );
}

/**
 * Adds a label to a Mbiaat subscriber.
 */
export async function addLabel(
  apiToken: string,
  subscriberId: string,
  labelId: string
): Promise<void> {
  await axios.post(
    `${getBaseUrl()}/subscriber/label/add`,
    { apiToken, subscriber_id: subscriberId, label_id: labelId }
  );
}

/**
 * Removes a label from a Mbiaat subscriber.
 */
export async function removeLabel(
  apiToken: string,
  subscriberId: string,
  labelId: string
): Promise<void> {
  await axios.post(
    `${getBaseUrl()}/subscriber/label/remove`,
    { apiToken, subscriber_id: subscriberId, label_id: labelId }
  );
}

/**
 * Creates a new label in a Mbiaat account.
 * Returns the new label's ID.
 */
export async function createLabel(
  apiToken: string,
  labelName: string
): Promise<string> {
  const response = await axios.post<{ data: { id: string } }>(
    `${getBaseUrl()}/label/create`,
    { apiToken, name: labelName }
  );

  return response.data.data.id;
}
