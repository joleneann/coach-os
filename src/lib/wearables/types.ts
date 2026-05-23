/**
 * Wearable Integration Types
 *
 * Shared types for Fitbit and Google Fit integrations.
 */

export type WearableProvider = "FITBIT" | "GOOGLE_FIT";

export interface WearableConfig {
  provider: WearableProvider;
  clientId: string;      // OAuth client ID
  clientSecret: string;  // OAuth client secret
  authUrl: string;       // OAuth authorization URL
  tokenUrl: string;      // OAuth token exchange URL
  scopes: string[];      // Required OAuth scopes
  redirectUri: string;   // Callback URL
}

export interface WearableDataPoint {
  date: string;       // YYYY-MM-DD
  dataType: "steps" | "sleep" | "heart_rate" | "active_minutes";
  value: number;
  unit: string;
}

export interface WearableTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope?: string;
  providerUserId?: string;
}

/**
 * Provider interface that each wearable must implement.
 */
export interface WearableProviderAdapter {
  provider: WearableProvider;
  getAuthUrl(state: string): string;
  exchangeCode(code: string): Promise<WearableTokens>;
  refreshTokens(refreshToken: string): Promise<WearableTokens>;
  fetchData(accessToken: string, date: string): Promise<WearableDataPoint[]>;
}
