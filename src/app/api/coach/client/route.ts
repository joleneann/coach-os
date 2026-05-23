import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computeBMI, computeWHR, scoreGHQ28 } from "@/lib/intake-summary-prompt";

/**
 * GET /api/coach/client?id=xxx
 *
 * Fetch client data for the plan builder, including intake summary,
 * red flags, and computed metrics.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COACH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("id");

  if (!clientId) {
    return NextResponse.json(
      { error: "id is required" },
      { status: 400 }
    );
  }

  try {
    const client = await prisma.user.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        name: true,
        email: true,
        coachId: true,
        intakeSubmissions: {
          where: { status: "COMPLETE" },
          include: { responses: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!client || client.coachId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const submission = client.intakeSubmissions[0];
    if (!submission) {
      return NextResponse.json({
        name: client.name,
        email: client.email,
        submissionId: null,
        summary: null,
        redFlags: [],
        bmi: null,
        whr: null,
      });
    }

    // Build response map for metric computation
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

    return NextResponse.json({
      name: client.name,
      email: client.email,
      submissionId: submission.id,
      summary: submission.summary,
      redFlags: submission.redFlags || [],
      bmi,
      whr,
      ghqScores,
    });
  } catch (error) {
    console.error("Coach client fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch client" },
      { status: 500 }
    );
  }
}
