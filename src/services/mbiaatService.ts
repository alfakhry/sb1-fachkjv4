/**
 * Mbiaat API service — merchant account creation, direct login URL, account info, and subscriber management.
 * All external Mbiaat API calls live here.
 */

import crypto from 'crypto';
import axios from 'axios';
import {
  MbiaatCreateUserResponse,
  MbiaatDirectLoginResponse,
  MbiaatUserInfo,
  MbiaatCreateSubscriberResponse,
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
 * Updates a Mbiaat subscriber's profile fields.
 */
export async function updateSubscriber(
  apiToken: string,
  subscriberId: string,
  data: Record<string, unknown>
): Promise<void> {
  await axios.post(`${getBaseUrl()}/subscriber/update`, {
    apiToken,
    id: subscriberId,
    ...data,
  });
}

/**
 * Sets custom field values on a Mbiaat subscriber (e.g. order stats, segment).
 */
export async function updateCustomFields(
  apiToken: string,
  subscriberId: string,
  fields: Record<string, unknown>
): Promise<void> {
  await axios.post(`${getBaseUrl()}/subscriber/chat/assign-custom-fields`, {
    apiToken,
    id: subscriberId,
    data: fields,
  });
}

/**
 * Enrolls a Mbiaat subscriber into a sequence by sequenceId.
 */
export async function addToSequence(
  apiToken: string,
  subscriberId: string,
  sequenceId: string
): Promise<void> {
  await axios.post(`${getBaseUrl()}/subscriber/chat/assign-sequence`, {
    apiToken,
    id: subscriberId,
    sequence_id: sequenceId,
  });
}

/**
 * Removes a Mbiaat subscriber from a sequence by sequenceId.
 */
export async function removeFromSequence(
  apiToken: string,
  subscriberId: string,
  sequenceId: string
): Promise<void> {
  await axios.post(`${getBaseUrl()}/subscriber/chat/remove-sequence`, {
    apiToken,
    id: subscriberId,
    sequence_id: sequenceId,
  });
}

/**
 * Adds a label to a Mbiaat subscriber.
 */
export async function addLabel(
  apiToken: string,
  subscriberId: string,
  labelId: string
): Promise<void> {
  await axios.post(`${getBaseUrl()}/subscriber/chat/assign-label`, {
    apiToken,
    id: subscriberId,
    label_id: labelId,
  });
}

/**
 * Removes a label from a Mbiaat subscriber.
 */
export async function removeLabel(
  apiToken: string,
  subscriberId: string,
  labelId: string
): Promise<void> {
  await axios.post(`${getBaseUrl()}/subscriber/chat/remove-label`, {
    apiToken,
    id: subscriberId,
    label_id: labelId,
  });
}

/**
 * Creates a new label in Mbiaat and returns the label ID.
 */
export async function createLabel(
  apiToken: string,
  name: string
): Promise<string> {
  const response = await axios.post<{ data: { id: string } }>(
    `${getBaseUrl()}/label/create`,
    { apiToken, name }
  );
  return response.data.data.id;
}

/**
 * Creates a WhatsApp subscriber in Mbiaat for a given customer.
 * Returns the new subscriber ID.
 */
export async function createSubscriber(
  apiToken: string,
  customer: { phone: string | null; name: string | null; email: string | null }
): Promise<MbiaatCreateSubscriberResponse> {
  const response = await axios.post<{ data: MbiaatCreateSubscriberResponse }>(
    `${getBaseUrl()}/subscriber/create`,
    {
      apiToken,
      phone: customer.phone,
      name: customer.name,
      email: customer.email ?? null,
    }
  );

  return response.data.data;
}
