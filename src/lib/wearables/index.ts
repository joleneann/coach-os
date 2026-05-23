/**
 * Wearable Integration — Provider Registry
 *
 * Central access point for all wearable adapters.
 */

import type { WearableProvider, WearableProviderAdapter } from "./types";
import { createFitbitAdapter } from "./fitbit";
import { createGoogleFitAdapter } from "./google-fit";

export type { WearableProvider, WearableProviderAdapter, WearableDataPoint, WearableTokens } from "./types";

const adapters: Record<WearableProvider, () => WearableProviderAdapter> = {
  FITBIT: createFitbitAdapter,
  GOOGLE_FIT: createGoogleFitAdapter,
};

/**
 * Get a wearable adapter by provider name.
 * Returns null if provider credentials are not configured.
 */
export function getWearableAdapter(
  provider: WearableProvider
): WearableProviderAdapter | null {
  const factory = adapters[provider];
  if (!factory) return null;

  // Check if required env vars exist
  if (provider === "FITBIT" && !process.env.FITBIT_CLIENT_ID) return null;
  if (provider === "GOOGLE_FIT" && !process.env.GOOGLE_FIT_CLIENT_ID) return null;

  return factory();
}

/**
 * List available (configured) wearable providers.
 */
export function getAvailableProviders(): WearableProvider[] {
  const available: WearableProvider[] = [];
  if (process.env.FITBIT_CLIENT_ID) available.push("FITBIT");
  if (process.env.GOOGLE_FIT_CLIENT_ID) available.push("GOOGLE_FIT");
  return available;
}
