import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * POST /api/plan/generate
 *
 * Saves AI-generated plan sections to the database.
 * Called after Claude Code generates the plan content via scripts/generate-plan.mjs.
 * Can also be called from the UI to save manually-written sections.
 *
 * Body: { planId: string, sections: { type: string, content: string, order: number }[] }
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COACH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { planId, sections } = await req.json();

  if (!planId || !sections || !Array.isArray(sections)) {
    return NextResponse.json(
      { error: "planId and sections array are required" },
      { status: 400 }
    );
  }

  try {
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: { client: { select: { coachId: true } } },
    });

    if (!plan || plan.client.coachId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete existing sections (regenerating)
    await prisma.planSection.deleteMany({ where: { planId } });

    // Create new sections
    for (const section of sections) {
      await prisma.planSection.create({
        data: {
          planId,
          sectionType: section.type,
          content: section.content,
          order: section.order,
        },
      });
    }

    // Update plan status
    await prisma.plan.update({
      where: { id: planId },
      data: {
        status: "COACH_REVIEW",
        generatedContent: {
          generatedAt: new Date().toISOString(),
          sectionCount: sections.length,
        },
      },
    });

    return NextResponse.json({
      saved: true,
      sectionCount: sections.length,
    });
  } catch (error) {
    console.error("Plan save error:", error);
    return NextResponse.json(
      { error: "Failed to save plan sections" },
      { status: 500 }
    );
  }
}
