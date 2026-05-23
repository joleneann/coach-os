import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getWearableAdapter } from "@/lib/wearables";
import type { WearableProvider } from "@/lib/wearables";

/**
 * GET /api/wearables/connect?provider=FITBIT
 *
 * Initiates OAuth flow for a wearable provider.
 * Redirects the client to the provider's auth page.
 * Auth: CLIENT only.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const provider = url.searchParams.get("provider") as WearableProvider | null;

  if (!provider || !["FITBIT", "GOOGLE_FIT"].includes(provider)) {
    return NextResponse.json(
      { error: "Invalid provider. Use FITBIT or GOOGLE_FIT." },
      { status: 400 }
    );
  }

  const adapter = getWearableAdapter(provider);
  if (!adapter) {
    return NextResponse.json(
      { error: `${provider} is not configured. Contact your coach.` },
      { status: 503 }
    );
  }

  // State includes user ID for verification in callback
  const state = Buffer.from(
    JSON.stringify({ userId: session.user.id, provider })
  ).toString("base64url");

  const authUrl = adapter.getAuthUrl(state);
  return NextResponse.redirect(authUrl);
}
