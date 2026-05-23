import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  computeBMI,
  computeWHR,
  scoreGHQ28,
} from "@/lib/intake-summary-prompt";
import { detectRedFlags } from "@/lib/red-flag-detection";

/**
 * POST /api/intake/summarize
 *
 * Computes metrics and detects red flags for a completed intake.
 * The AI summary is generated separately via Claude Code script.
 * This endpoint handles the rule-based parts only.
 *
 * Body: { submissionId: string, summary?: string }
 * If summary is provided, it saves it (called from Claude Code save step).
 * If not, it just computes metrics and flags.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COACH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { submissionId, summary } = await req.json();

  if (!submissionId) {
    return NextResponse.json(
      { error: "submissionId is required" },
      { status: 400 }
    );
  }

  try {
    const submission = await prisma.intakeSubmission.findUnique({
      where: { id: submissionId },
      include: {
        responses: true,
        client: { select: { id: true, coachId: true } },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (submission.client.coachId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Build response map
    const responseMap: Record<string, Record<string, unknown>> = {};
    for (const r of submission.responses) {
      if (!responseMap[r.sectionKey]) responseMap[r.sectionKey] = {};
      responseMap[r.sectionKey][r.questionKey] = r.value;
    }

    const bmi = computeBMI(responseMap);
    const whr = computeWHR(responseMap);
    const ghqScores = responseMap["ghq28"]
      ? scoreGHQ28(responseMap["ghq28"])
      : null;
    const redFlags = detectRedFlags(responseMap, bmi, ghqScores);

    // Save to database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      redFlags: JSON.parse(JSON.stringify(redFlags)),
    };

    if (summary) {
      updateData.summary = JSON.parse(
        JSON.stringify({
          text: summary,
          bmi,
          whr,
          ghqScores,
          generatedAt: new Date().toISOString(),
        })
      );
    }

    await prisma.intakeSubmission.update({
      where: { id: submissionId },
      data: updateData,
    });

    return NextResponse.json({
      summary: summary || null,
      redFlags,
      bmi,
      whr,
      ghqScores,
    });
  } catch (error) {
    console.error("Intake summarize error:", error);
    return NextResponse.json(
      { error: "Failed to process intake" },
      { status: 500 }
    );
  }
}
