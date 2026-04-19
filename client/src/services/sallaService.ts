/**
 * Salla API service — store info retrieval and OAuth token refresh.
 * All external Salla API calls live here.
 */

import axios from 'axios';
import prisma from '../lib/prisma';
import { SALLA_API_BASE, SALLA_ACCOUNTS_BASE, MUTEX_RETRY_DELAY_MS } from '../lib/constants';
import { SallaStoreInfo, TokenRefreshResponse } from '../types';

const refreshMutex = new Map<number, boolean>();

/**
 * Fetches basic store info from the Salla API.
 */
export async function getStoreInfo(accessToken: string): Promise<SallaStoreInfo> {
  const response = await axios.get<{ data: { name: string; domain: string } }>(
    `${SALLA_API_BASE}/store/info`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  const { name, domain } = response.data.data;
  return { name, domain };
}

/**
 * Refreshes the Salla OAuth token for a merchant.
 * Uses an in-memory mutex to prevent concurrent refreshes for the same merchant.
 * Silently fails on error (cron-safe).
 */
export async function refreshToken(merchantId: number, currentRefreshToken: string): Promise<void> {
  if (refreshMutex.get(merchantId)) {
    console.log(`[sallaService] Token refresh already in progress for merchant ${merchantId}, retrying after delay`);
    await new Promise((resolve) => setTimeout(resolve, MUTEX_RETRY_DELAY_MS));

    if (refreshMutex.get(merchantId)) {
      console.log(`[sallaService] Refresh still locked for merchant ${merchantId}, skipping`);
      return;
    }
  }

  refreshMutex.set(merchantId, true);

  try {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.SALLA_CLIENT_ID!,
      client_secret: process.env.SALLA_CLIENT_SECRET!,
      refresh_token: currentRefreshToken,
    });

    const response = await axios.post<TokenRefreshResponse>(
      `${SALLA_ACCOUNTS_BASE}/token`,
      params.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token, refresh_token, expires_in } = response.data;
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);

    await prisma.merchants.update({
      where: { id: merchantId },
      data: {
        access_token,
        refresh_token,
        token_expires_at: tokenExpiresAt,
        updated_at: new Date(),
      },
    });

    console.log(`[sallaService] Token refreshed for merchant ${merchantId}`);
  } catch (error) {
    console.error(`[sallaService] Failed to refresh token for merchant ${merchantId}:`, error);
  } finally {
    refreshMutex.delete(merchantId);
  }
}
