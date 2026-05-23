import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/review/view?clientId=xxx&weekStart=xxx
 *
 * Fetch a specific weekly review. If no weekStart, returns latest.
 * CLIENT: own data, only DELIVERED reviews.
 * COACH: own client, any status.
 *
 * GET /api/review/list?clientId=xxx
 *
 * List all reviews for a client (id, weekStartDate, status, createdAt).
 * CLIENT: own data, only DELIVERED.
 * COACH: own client, all statuses.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") || "view"; // "view" or "list"
  const clientId =
    session.user.role === "CLIENT"
      ? session.user.id
      : url.searchParams.get("clientId");
  const weekStartParam = url.searchParams.get("weekStart");

  if (!clientId) {
    return NextResponse.json(
      { error: "clientId is required" },
      { status: 400 }
    );
  }

  try {
    // Verify access
    if (session.user.role === "COACH") {
      const client = await prisma.user.findUnique({
        where: { id: clientId },
        select: { coachId: true },
      });
      if (!client || client.coachId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const statusFilter =
      session.user.role === "CLIENT"
        ? { status: "DELIVERED" as const }
        : {};

    if (mode === "list") {
      const reviews = await prisma.weeklyReview.findMany({
        where: { clientId, ...statusFilter },
        select: {
          id: true,
          weekStartDate: true,
          status: true,
          createdAt: true,
          approvedAt: true,
          deliveredAt: true,
        },
        orderBy: { weekStartDate: "desc" },
      });

      return NextResponse.json({ reviews });
    }

    // View mode: fetch single review with full data
    const whereClause: Record<string, unknown> = { clientId, ...statusFilter };

    if (weekStartParam) {
      whereClause.weekStartDate = new Date(weekStartParam + "T00:00:00.000Z");
    }

    const review = weekStartParam
      ? await prisma.weeklyReview.findFirst({
          where: whereClause,
        })
      : await prisma.weeklyReview.findFirst({
          where: whereClause,
          orderBy: { weekStartDate: "desc" },
        });

    if (!review) {
      return NextResponse.json({ review: null });
    }

    return NextResponse.json({
      review: {
        id: review.id,
        weekStartDate: review.weekStartDate.toISOString().split("T")[0],
        status: review.status,
        synthesisData: review.synthesisData,
        citations: review.citations,
        coachFeedback: review.coachFeedback,
        approvedAt: review.approvedAt,
        deliveredAt: review.deliveredAt,
        createdAt: review.createdAt,
      },
    });
  } catch (error) {
    console.error("Review view error:", error);
    return NextResponse.json(
      { error: "Failed to fetch review" },
      { status: 500 }
    );
  }
}
