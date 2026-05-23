import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * POST /api/plan/edit
 *
 * Coach edits a specific section of the generated plan.
 * Stores edits separately from generated content so diffs are visible.
 *
 * Body: { planId: string, sectionType: string, content: string }
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COACH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { planId, sectionType, content } = await req.json();

  if (!planId || !sectionType || content === undefined) {
    return NextResponse.json(
      { error: "planId, sectionType, and content are required" },
      { status: 400 }
    );
  }

  try {
    // Verify plan exists and coach owns it
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: { client: { select: { coachId: true } } },
    });

    if (!plan || plan.client.coachId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (plan.status !== "COACH_REVIEW" && plan.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Plan is not in an editable state" },
        { status: 400 }
      );
    }

    // Update the PlanSection content
    const section = await prisma.planSection.findFirst({
      where: { planId, sectionType },
    });

    if (!section) {
      return NextResponse.json(
        { error: "Section not found" },
        { status: 404 }
      );
    }

    await prisma.planSection.update({
      where: { id: section.id },
      data: { content },
    });

    // Track edits in the plan's coachEdits JSON
    const existingEdits = (plan.coachEdits as Record<string, unknown>) || {};
    const updatedEdits = {
      ...existingEdits,
      [sectionType]: {
        editedAt: new Date().toISOString(),
        edited: true,
      },
    };

    await prisma.plan.update({
      where: { id: planId },
      data: { coachEdits: updatedEdits as object },
    });

    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("Plan edit error:", error);
    return NextResponse.json(
      { error: "Failed to save edit" },
      { status: 500 }
    );
  }
}
