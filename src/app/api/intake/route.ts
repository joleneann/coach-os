import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Save intake responses (called on each section completion)
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { submissionId, sectionKey, responses, currentSection } =
    await req.json();

  try {
    // Get or create submission
    let submission;
    if (submissionId) {
      submission = await prisma.intakeSubmission.findUnique({
        where: { id: submissionId },
      });
      if (!submission || submission.clientId !== session.user.id) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
    } else {
      submission = await prisma.intakeSubmission.create({
        data: {
          clientId: session.user.id,
          currentSection: 0,
        },
      });
    }

    // Upsert each response
    for (const [questionKey, value] of Object.entries(responses)) {
      await prisma.intakeResponse.upsert({
        where: {
          submissionId_sectionKey_questionKey: {
            submissionId: submission.id,
            sectionKey,
            questionKey,
          },
        },
        update: {
          value: value as object,
        },
        create: {
          submissionId: submission.id,
          sectionKey,
          questionKey,
          value: value as object,
        },
      });
    }

    // Update current section progress
    if (currentSection !== undefined) {
      await prisma.intakeSubmission.update({
        where: { id: submission.id },
        data: { currentSection },
      });
    }

    return NextResponse.json({
      submissionId: submission.id,
      saved: true,
    });
  } catch (error) {
    console.error("Intake save error:", error);
    return NextResponse.json(
      { error: "Failed to save" },
      { status: 500 }
    );
  }
}

// Get existing intake submission for resume
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submission = await prisma.intakeSubmission.findFirst({
    where: {
      clientId: session.user.id,
      status: "IN_PROGRESS",
    },
    include: {
      responses: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!submission) {
    return NextResponse.json({ submission: null });
  }

  // Convert responses to a map: { sectionKey: { questionKey: value } }
  const responseMap: Record<string, Record<string, unknown>> = {};
  for (const r of submission.responses) {
    if (!responseMap[r.sectionKey]) responseMap[r.sectionKey] = {};
    responseMap[r.sectionKey][r.questionKey] = r.value;
  }

  return NextResponse.json({
    submission: {
      id: submission.id,
      currentSection: submission.currentSection,
      responses: responseMap,
    },
  });
}
