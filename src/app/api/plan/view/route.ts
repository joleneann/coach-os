import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/plan/view?clientId=xxx
 *
 * Fetch the latest plan and its sections for a client.
 * Works for both coach (review) and client (delivery) views.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
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
    // Access control
    if (session.user.role === "COACH") {
      const client = await prisma.user.findUnique({
        where: { id: clientId },
        select: { coachId: true },
      });
      if (!client || client.coachId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (session.user.role === "CLIENT") {
      if (session.user.id !== clientId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // For clients, only show APPROVED or DELIVERED plans
    const statusFilter =
      session.user.role === "CLIENT"
        ? { status: { in: ["APPROVED" as const, "DELIVERED" as const] } }
        : {};

    // For coach review, prefer the plan with sections (COACH_REVIEW > DRAFT)
    // For client, only APPROVED/DELIVERED are shown anyway
    let plan = await prisma.plan.findFirst({
      where: {
        clientId,
        ...statusFilter,
        sections: { some: {} }, // Has at least one section
      },
      include: {
        sections: { orderBy: { order: "asc" } },
        client: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fallback: if no plan with sections, get the latest plan
    if (!plan) {
      plan = await prisma.plan.findFirst({
        where: {
          clientId,
          ...statusFilter,
        },
        include: {
          sections: { orderBy: { order: "asc" } },
          client: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!plan) {
      return NextResponse.json({
        planId: null,
        status: null,
        sections: [],
        clientName: null,
      });
    }

    // If client is viewing an APPROVED plan for the first time, mark as DELIVERED
    if (
      session.user.role === "CLIENT" &&
      plan.status === "APPROVED"
    ) {
      await prisma.plan.update({
        where: { id: plan.id },
        data: {
          status: "DELIVERED",
          deliveredAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      planId: plan.id,
      status: plan.status,
      version: plan.version,
      sections: plan.sections,
      clientName: plan.client.name,
      coachEdits: plan.coachEdits,
      approvedAt: plan.approvedAt,
      deliveredAt: plan.deliveredAt,
    });
  } catch (error) {
    console.error("Plan view error:", error);
    return NextResponse.json(
      { error: "Failed to fetch plan" },
      { status: 500 }
    );
  }
}
