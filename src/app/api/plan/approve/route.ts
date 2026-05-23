import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateTrackerTemplate } from "@/lib/tracker-template";
import type { CoachDecisions } from "@/lib/coach-decision-schema";

/**
 * POST /api/plan/approve
 *
 * Coach approves a plan, moving it from COACH_REVIEW to APPROVED.
 *
 * Body: { planId: string }
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COACH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { planId } = await req.json();

  if (!planId) {
    return NextResponse.json(
      { error: "planId is required" },
      { status: 400 }
    );
  }

  try {
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: { client: { select: { coachId: true, id: true } } },
    });

    if (!plan || plan.client.coachId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (plan.status !== "COACH_REVIEW" && plan.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Plan must be in DRAFT or COACH_REVIEW status to approve" },
        { status: 400 }
      );
    }

    await prisma.plan.update({
      where: { id: planId },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
      },
    });

    // Update client status to ACTIVE + set dashboard mode from decisions
    const decisions = plan.coachDecisions as CoachDecisions | null;
    await prisma.user.update({
      where: { id: plan.clientId },
      data: {
        status: "ACTIVE",
        ...(decisions?.dashboardMode
          ? { dashboardMode: decisions.dashboardMode }
          : {}),
      },
    });

    // Auto-generate tracker template from coach decisions
    if (decisions) {
      const templateFields = generateTrackerTemplate(decisions);
      await prisma.trackerTemplate.create({
        data: {
          clientId: plan.clientId,
          planId: plan.id,
          fields: templateFields as unknown as object,
        },
      });
    }

    return NextResponse.json({ approved: true });
  } catch (error) {
    console.error("Plan approve error:", error);
    return NextResponse.json(
      { error: "Failed to approve plan" },
      { status: 500 }
    );
  }
}
