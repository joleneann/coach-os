import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/tracker/template?clientId=xxx
 *
 * Fetch the latest tracker template for a client.
 * Works for both CLIENT (own data) and COACH (own client).
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  let clientId = searchParams.get("clientId");

  // Clients can only fetch their own template
  if (session.user.role === "CLIENT") {
    clientId = session.user.id;
  }

  if (!clientId) {
    return NextResponse.json(
      { error: "clientId is required" },
      { status: 400 }
    );
  }

  try {
    // Access control for coaches
    if (session.user.role === "COACH") {
      const client = await prisma.user.findUnique({
        where: { id: clientId },
        select: { coachId: true },
      });
      if (!client || client.coachId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Get the latest template for this client
    const template = await prisma.trackerTemplate.findFirst({
      where: { clientId },
      orderBy: { createdAt: "desc" },
    });

    // Get the client's dashboard mode
    const user = await prisma.user.findUnique({
      where: { id: clientId },
      select: { dashboardMode: true },
    });

    return NextResponse.json({
      template: template
        ? { id: template.id, fields: template.fields, planId: template.planId }
        : null,
      dashboardMode: user?.dashboardMode || "STANDARD",
    });
  } catch (error) {
    console.error("Tracker template fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracker template" },
      { status: 500 }
    );
  }
}
