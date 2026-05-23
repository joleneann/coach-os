/**
 * Google Fit Integration Adapter
 *
 * Implements OAuth 2.0 flow and data fetching for Google Fit REST API.
 * Requires GOOGLE_FIT_CLIENT_ID and GOOGLE_FIT_CLIENT_SECRET env vars.
 *
 * Docs: https://developers.google.com/fit/rest
 */

import type {
  WearableProviderAdapter,
  WearableTokens,
  WearableDataPoint,
} from "./types";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const FITNESS_API_BASE = "https://www.googleapis.com/fitness/v1";

export function createGoogleFitAdapter(): WearableProviderAdapter {
  const clientId = process.env.GOOGLE_FIT_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_FIT_CLIENT_SECRET || "";
  const redirectUri =
    process.env.GOOGLE_FIT_REDIRECT_URI ||
    `${process.env.NEXTAUTH_URL}/api/wearables/callback?provider=GOOGLE_FIT`;

  return {
    provider: "GOOGLE_FIT",

    getAuthUrl(state: string): string {
      const params = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: [
          "https://www.googleapis.com/auth/fitness.activity.read",
          "https://www.googleapis.com/auth/fitness.sleep.read",
          "https://www.googleapis.com/auth/fitness.heart_rate.read",
        ].join(" "),
        state,
        access_type: "offline",
        prompt: "consent",
      });
      return `${GOOGLE_AUTH_URL}?${params.toString()}`;
    },

    async exchangeCode(code: string): Promise<WearableTokens> {
      const res = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      if (!res.ok) {
        throw new Error(`Google token exchange failed: ${res.status}`);
      }

      const data = await res.json();
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
        scope: data.scope,
      };
    },

    async refreshTokens(refreshToken: string): Promise<WearableTokens> {
      const res = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      if (!res.ok) {
        throw new Error(`Google token refresh failed: ${res.status}`);
      }

      const data = await res.json();
      return {
        accessToken: data.access_token,
        refreshToken: refreshToken, // Google doesn't always return a new refresh token
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
      };
    },

    async fetchData(
      accessToken: string,
      date: string
    ): Promise<WearableDataPoint[]> {
      const points: WearableDataPoint[] = [];

      // Convert date to nanosecond timestamps for Google Fit
      const startOfDay = new Date(date + "T00:00:00.000Z").getTime() * 1e6;
      const endOfDay = new Date(date + "T23:59:59.999Z").getTime() * 1e6;

      // Steps
      try {
        const stepsRes = await fetch(
          `${FITNESS_API_BASE}/users/me/dataset:aggregate`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              aggregateBy: [
                {
                  dataTypeName: "com.google.step_count.delta",
                  dataSourceId:
                    "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps",
                },
              ],
              bucketByTime: { durationMillis: 86400000 },
              startTimeMillis: startOfDay / 1e6,
              endTimeMillis: endOfDay / 1e6,
            }),
          }
        );

        if (stepsRes.ok) {
          const stepsData = await stepsRes.json();
          const bucket = stepsData?.bucket?.[0];
          const steps =
            bucket?.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal;
          if (steps !== undefined) {
            points.push({ date, dataType: "steps", value: steps, unit: "steps" });
          }
        }
      } catch (e) {
        console.error("Google Fit steps fetch error:", e);
      }

      // Sleep (if available)
      try {
        const sleepRes = await fetch(
          `${FITNESS_API_BASE}/users/me/sessions?startTime=${date}T00:00:00.000Z&endTime=${date}T23:59:59.999Z&activityType=72`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (sleepRes.ok) {
          const sleepData = await sleepRes.json();
          const sessions = sleepData?.session || [];
          let totalMs = 0;
          for (const s of sessions) {
            totalMs +=
              parseInt(s.endTimeMillis) - parseInt(s.startTimeMillis);
          }
          if (totalMs > 0) {
            points.push({
              date,
              dataType: "sleep",
              value: Math.round((totalMs / 3600000) * 10) / 10,
              unit: "hours",
            });
          }
        }
      } catch (e) {
        console.error("Google Fit sleep fetch error:", e);
      }

      return points;
    },
  };
}
