import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * POST /api/plan/decisions
 *
 * Coach saves clinical decisions for a client's plan.
 * Creates a new Plan record (DRAFT status) or updates existing one.
 *
 * Body: { clientId: string, decisions: CoachDecisions }
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COACH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clientId, decisions } = await req.json();

  if (!clientId || !decisions) {
    return NextResponse.json(
      { error: "clientId and decisions are required" },
      { status: 400 }
    );
  }

  try {
    // Verify the coach owns this client
    const client = await prisma.user.findUnique({
      where: { id: clientId },
      select: { coachId: true },
    });

    if (!client || client.coachId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find existing editable plan (DRAFT or COACH_REVIEW) or create new one
    let plan = await prisma.plan.findFirst({
      where: {
        clientId,
        status: { in: ["DRAFT", "COACH_REVIEW"] },
      },
      orderBy: { createdAt: "desc" },
    });

    if (plan) {
      plan = await prisma.plan.update({
        where: { id: plan.id },
        data: { coachDecisions: decisions as object },
      });
    } else {
      // Determine version number
      const latestPlan = await prisma.plan.findFirst({
        where: { clientId },
        orderBy: { version: "desc" },
      });
      const nextVersion = (latestPlan?.version || 0) + 1;

      plan = await prisma.plan.create({
        data: {
          clientId,
          version: nextVersion,
          status: "DRAFT",
          coachDecisions: decisions as object,
        },
      });
    }

    return NextResponse.json({ planId: plan.id, saved: true });
  } catch (error) {
    console.error("Plan decisions save error:", error);
    return NextResponse.json(
      { error: "Failed to save decisions" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/plan/decisions?clientId=xxx
 *
 * Retrieve existing coach decisions for a client (from DRAFT plan).
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COACH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");

  if (!clientId) {
    return NextResponse.json(
      { error: "clientId is required" },
      { status: 400 }
    );
  }

  try {
    const client = await prisma.user.findUnique({
      where: { id: clientId },
      select: { coachId: true },
    });

    if (!client || client.coachId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const plan = await prisma.plan.findFirst({
      where: {
        clientId,
        status: { in: ["DRAFT", "COACH_REVIEW"] },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      planId: plan?.id || null,
      decisions: plan?.coachDecisions || null,
    });
  } catch (error) {
    console.error("Plan decisions fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch decisions" },
      { status: 500 }
    );
  }
}
