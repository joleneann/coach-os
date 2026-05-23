import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { TrackerField } from "@/lib/tracker-template";
import { applyGraduation } from "@/lib/habit-graduation";

/**
 * POST /api/tracker/update
 *
 * Coach applies approved tracker changes (graduation, demotion, add/remove habits).
 * Updates the TrackerTemplate.fields JSON.
 *
 * Body: {
 *   clientId: string,
 *   changes: {
 *     type: "graduate" | "demote" | "add_habit" | "remove_habit",
 *     fieldKey?: string,
 *     newFrequency?: "daily" | "twice_weekly" | "weekly",
 *     newField?: TrackerField
 *   }[]
 * }
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COACH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clientId, changes } = await req.json();

  if (!clientId || !changes || !Array.isArray(changes) || changes.length === 0) {
    return NextResponse.json(
      { error: "clientId and changes[] are required" },
      { status: 400 }
    );
  }

  try {
    // Verify coach owns this client
    const client = await prisma.user.findUnique({
      where: { id: clientId },
      select: { coachId: true },
    });

    if (!client || client.coachId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch latest tracker template
    const template = await prisma.trackerTemplate.findFirst({
      where: { clientId },
      orderBy: { createdAt: "desc" },
    });

    if (!template) {
      return NextResponse.json(
        { error: "No tracker template found" },
        { status: 400 }
      );
    }

    let fields = template.fields as unknown as TrackerField[];
    const applied: string[] = [];

    for (const change of changes) {
      if (change.type === "graduate" || change.type === "demote") {
        if (!change.fieldKey || !change.newFrequency) continue;

        fields = fields.map((f) => {
          if (f.key === change.fieldKey) {
            applied.push(
              `${change.type === "graduate" ? "Graduated" : "Demoted"} "${f.label}" to ${change.newFrequency}`
            );
            return applyGraduation(f, change.newFrequency);
          }
          return f;
        });
      } else if (change.type === "add_habit" && change.newField) {
        // Ensure no duplicate key
        if (fields.some((f) => f.key === change.newField.key)) {
          applied.push(`Skipped "${change.newField.label}" (already exists)`);
          continue;
        }
        const newField: TrackerField = {
          ...change.newField,
          frequency: change.newField.frequency || "daily",
          order: fields.length,
        };
        fields.push(newField);
        applied.push(`Added new habit: "${newField.label}"`);
      } else if (change.type === "remove_habit" && change.fieldKey) {
        const removed = fields.find((f) => f.key === change.fieldKey);
        if (removed) {
          fields = fields.filter((f) => f.key !== change.fieldKey);
          applied.push(`Removed "${removed.label}"`);
        }
      }
    }

    // Save updated fields
    await prisma.trackerTemplate.update({
      where: { id: template.id },
      data: { fields: fields as unknown as object },
    });

    return NextResponse.json({
      updated: true,
      applied,
      fieldCount: fields.length,
    });
  } catch (error) {
    console.error("Tracker update error:", error);
    return NextResponse.json(
      { error: "Failed to update tracker" },
      { status: 500 }
    );
  }
}
