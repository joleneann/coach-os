/**
 * Fitbit Integration Adapter
 *
 * Implements OAuth 2.0 flow and data fetching for Fitbit Web API.
 * Requires FITBIT_CLIENT_ID and FITBIT_CLIENT_SECRET env vars.
 *
 * Docs: https://dev.fitbit.com/build/reference/web-api/
 */

import type {
  WearableProviderAdapter,
  WearableTokens,
  WearableDataPoint,
} from "./types";

const FITBIT_AUTH_URL = "https://www.fitbit.com/oauth2/authorize";
const FITBIT_TOKEN_URL = "https://api.fitbit.com/oauth2/token";
const FITBIT_API_BASE = "https://api.fitbit.com";

export function createFitbitAdapter(): WearableProviderAdapter {
  const clientId = process.env.FITBIT_CLIENT_ID || "";
  const clientSecret = process.env.FITBIT_CLIENT_SECRET || "";
  const redirectUri =
    process.env.FITBIT_REDIRECT_URI ||
    `${process.env.NEXTAUTH_URL}/api/wearables/callback?provider=FITBIT`;

  return {
    provider: "FITBIT",

    getAuthUrl(state: string): string {
      const params = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: "activity heartrate sleep",
        state,
      });
      return `${FITBIT_AUTH_URL}?${params.toString()}`;
    },

    async exchangeCode(code: string): Promise<WearableTokens> {
      const res = await fetch(FITBIT_TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }),
      });

      if (!res.ok) {
        throw new Error(`Fitbit token exchange failed: ${res.status}`);
      }

      const data = await res.json();
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
        scope: data.scope,
        providerUserId: data.user_id,
      };
    },

    async refreshTokens(refreshToken: string): Promise<WearableTokens> {
      const res = await fetch(FITBIT_TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      });

      if (!res.ok) {
        throw new Error(`Fitbit token refresh failed: ${res.status}`);
      }

      const data = await res.json();
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
        scope: data.scope,
        providerUserId: data.user_id,
      };
    },

    async fetchData(
      accessToken: string,
      date: string
    ): Promise<WearableDataPoint[]> {
      const points: WearableDataPoint[] = [];

      // Steps
      try {
        const stepsRes = await fetch(
          `${FITBIT_API_BASE}/1/user/-/activities/date/${date}.json`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (stepsRes.ok) {
          const stepsData = await stepsRes.json();
          const steps = stepsData?.summary?.steps;
          if (steps !== undefined) {
            points.push({ date, dataType: "steps", value: steps, unit: "steps" });
          }
          const activeMinutes =
            (stepsData?.summary?.fairlyActiveMinutes || 0) +
            (stepsData?.summary?.veryActiveMinutes || 0);
          if (activeMinutes > 0) {
            points.push({
              date,
              dataType: "active_minutes",
              value: activeMinutes,
              unit: "minutes",
            });
          }
        }
      } catch (e) {
        console.error("Fitbit steps fetch error:", e);
      }

      // Sleep
      try {
        const sleepRes = await fetch(
          `${FITBIT_API_BASE}/1.2/user/-/sleep/date/${date}.json`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (sleepRes.ok) {
          const sleepData = await sleepRes.json();
          const totalMinutes = sleepData?.summary?.totalMinutesAsleep;
          if (totalMinutes !== undefined) {
            points.push({
              date,
              dataType: "sleep",
              value: Math.round(totalMinutes / 60 * 10) / 10,
              unit: "hours",
            });
          }
        }
      } catch (e) {
        console.error("Fitbit sleep fetch error:", e);
      }

      // Resting heart rate
      try {
        const hrRes = await fetch(
          `${FITBIT_API_BASE}/1/user/-/activities/heart/date/${date}/1d.json`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (hrRes.ok) {
          const hrData = await hrRes.json();
          const restingHR =
            hrData?.["activities-heart"]?.[0]?.value?.restingHeartRate;
          if (restingHR) {
            points.push({
              date,
              dataType: "heart_rate",
              value: restingHR,
              unit: "bpm",
            });
          }
        }
      } catch (e) {
        console.error("Fitbit HR fetch error:", e);
      }

      return points;
    },
  };
}
