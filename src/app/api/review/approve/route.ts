import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * POST /api/review/approve
 *
 * Coach approves a weekly review (COACH_REVIEW → APPROVED).
 * Body: { reviewId: string, coachFeedback?: string }
 *
 * POST /api/review/approve?action=deliver
 *
 * Coach delivers an approved review to the client (APPROVED → DELIVERED).
 * Body: { reviewId: string }
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COACH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "approve";

  const body = await req.json();
  const { reviewId, coachFeedback, synthesisData: editedSynthesis } = body;

  if (!reviewId) {
    return NextResponse.json(
      { error: "reviewId is required" },
      { status: 400 }
    );
  }

  try {
    const review = await prisma.weeklyReview.findUnique({
      where: { id: reviewId },
      include: { client: { select: { coachId: true } } },
    });

    if (!review || review.client.coachId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (action === "approve") {
      if (review.status !== "COACH_REVIEW") {
        return NextResponse.json(
          { error: "Review must be in COACH_REVIEW status to approve" },
          { status: 400 }
        );
      }

      const updateData: Record<string, unknown> = {
        status: "APPROVED",
        approvedAt: new Date(),
      };

      // Allow coach to edit synthesis before approving
      if (editedSynthesis) {
        updateData.synthesisData = editedSynthesis as object;
      }

      if (coachFeedback !== undefined) {
        updateData.coachFeedback = coachFeedback;
      }

      await prisma.weeklyReview.update({
        where: { id: reviewId },
        data: updateData,
      });

      return NextResponse.json({ approved: true });
    }

    if (action === "deliver") {
      if (review.status !== "APPROVED") {
        return NextResponse.json(
          { error: "Review must be APPROVED before delivery" },
          { status: 400 }
        );
      }

      await prisma.weeklyReview.update({
        where: { id: reviewId },
        data: {
          status: "DELIVERED",
          deliveredAt: new Date(),
        },
      });

      return NextResponse.json({ delivered: true });
    }

    return NextResponse.json(
      { error: "Invalid action. Use 'approve' or 'deliver'." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Review approve error:", error);
    return NextResponse.json(
      { error: "Failed to process review" },
      { status: 500 }
    );
  }
}
