import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { intakeSections } from "@/lib/intake-schema";
import Link from "next/link";
import CollapsibleSection from "@/components/CollapsibleSection";
import LogoutButton from "@/components/LogoutButton";
import CheckInWeekView from "@/components/CheckInWeekView";
import CoachReviewSection from "@/components/CoachReviewSection";
import type { TrackerField } from "@/lib/tracker-template";
import { getWeekStartDate } from "@/lib/weekly-review";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COACH") redirect("/");

  const { id } = await params;

  const client = await prisma.user.findUnique({
    where: { id },
    include: {
      intakeSubmissions: {
        include: { responses: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!client || client.coachId !== session.user.id) {
    redirect("/coach");
  }

  const submission = client.intakeSubmissions[0];
  const responseMap: Record<string, Record<string, unknown>> = {};
  if (submission) {
    for (const r of submission.responses) {
      if (!responseMap[r.sectionKey]) responseMap[r.sectionKey] = {};
      responseMap[r.sectionKey][r.questionKey] = r.value;
    }
  }

  // Check for existing plans
  const latestPlan = await prisma.plan.findFirst({
    where: { clientId: id },
    orderBy: { createdAt: "desc" },
  });

  // Fetch tracker template + recent check-ins for the coach view
  const trackerTemplate = await prisma.trackerTemplate.findFirst({
    where: { clientId: id },
    orderBy: { createdAt: "desc" },
  });

  let recentCheckIns: { id: string; date: Date; responses: unknown }[] = [];
  if (trackerTemplate) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    recentCheckIns = await prisma.dailyCheckIn.findMany({
      where: {
        clientId: id,
        date: {
          gte: new Date(
            sevenDaysAgo.toISOString().split("T")[0] + "T00:00:00.000Z"
          ),
        },
      },
      orderBy: { date: "desc" },
      select: { id: true, date: true, responses: true },
    });
  }

  // Fetch weekly review data
  const currentWeekStart = getWeekStartDate();
  const currentWeekStartDate = new Date(currentWeekStart + "T00:00:00.000Z");
  const currentWeekEndDate = new Date(currentWeekStart + "T00:00:00.000Z");
  currentWeekEndDate.setDate(currentWeekEndDate.getDate() + 6);

  const currentReview = trackerTemplate
    ? await prisma.weeklyReview.findUnique({
        where: {
          clientId_weekStartDate: {
            clientId: id,
            weekStartDate: currentWeekStartDate,
          },
        },
      })
    : null;

  const pastReviews = trackerTemplate
    ? await prisma.weeklyReview.findMany({
        where: {
          clientId: id,
          weekStartDate: { lt: currentWeekStartDate },
        },
        select: { id: true, weekStartDate: true, status: true },
        orderBy: { weekStartDate: "desc" },
        take: 8,
      })
    : [];

  // Check if there are check-ins this week
  const thisWeekCheckIns = trackerTemplate
    ? await prisma.dailyCheckIn.count({
        where: {
          clientId: id,
          date: {
            gte: currentWeekStartDate,
            lte: new Date(currentWeekEndDate.toISOString().split("T")[0] + "T23:59:59.999Z"),
          },
        },
      })
    : 0;

  const height = responseMap?.basic_info?.height as string | undefined;
  const weight = responseMap?.basic_info?.weight as string | undefined;
  const heightM = height ? parseFloat(height) / 100 : null;
  const weightKg = weight ? parseFloat(weight) : null;
  const bmi =
    heightM && weightKg ? (weightKg / (heightM * heightM)).toFixed(1) : null;

  const waist = responseMap?.basic_info?.waist as string | undefined;
  const hip = responseMap?.basic_info?.hip as string | undefined;
  const whr =
    waist && hip
      ? (parseFloat(waist) / parseFloat(hip)).toFixed(2)
      : null;

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/coach"
              className="text-stone-400 hover:text-stone-600 text-sm"
            >
              ← Clients
            </Link>
            <h1 className="text-lg font-semibold text-stone-900">
              {client.name}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                submission?.status === "COMPLETE"
                  ? "bg-green-50 text-green-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {submission?.status === "COMPLETE"
                ? "Intake Complete"
                : "Intake In Progress"}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Plan Action Bar */}
        {submission?.status === "COMPLETE" && (
          <div className="mb-6 bg-white border border-stone-200 rounded-lg p-4 flex items-center justify-between">
            {latestPlan ? (
              <>
                <div>
                  <p className="text-sm font-medium text-stone-900">
                    Plan v{latestPlan.version}
                  </p>
                  <p className="text-xs text-stone-500">
                    Status:{" "}
                    <span
                      className={
                        latestPlan.status === "APPROVED"
                          ? "text-green-700"
                          : latestPlan.status === "COACH_REVIEW"
                            ? "text-blue-700"
                            : "text-amber-700"
                      }
                    >
                      {latestPlan.status.replace("_", " ")}
                    </span>
                  </p>
                </div>
                <Link
                  href={
                    latestPlan.status === "DRAFT"
                      ? `/coach/clients/${id}/plan`
                      : `/coach/clients/${id}/plan/review`
                  }
                  className="px-4 py-2 bg-stone-900 text-white text-sm rounded-lg hover:bg-stone-800"
                >
                  {latestPlan.status === "DRAFT"
                    ? "Continue Plan"
                    : latestPlan.status === "COACH_REVIEW"
                      ? "Review Plan"
                      : "View Plan"}
                </Link>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm font-medium text-stone-900">
                    Intake complete. Ready to create a plan.
                  </p>
                  <p className="text-xs text-stone-500">
                    Review the intake data below, then create the plan.
                  </p>
                </div>
                <Link
                  href={`/coach/clients/${id}/plan`}
                  className="px-4 py-2 bg-stone-900 text-white text-sm rounded-lg hover:bg-stone-800"
                >
                  Create Plan
                </Link>
              </>
            )}
          </div>
        )}

        {/* Recent Check-ins (only if tracker is set up) */}
        {trackerTemplate && (
          <div className="mb-6">
            <CheckInWeekView
              checkIns={recentCheckIns.map((ci) => ({
                id: ci.id,
                date: ci.date.toISOString(),
                responses: ci.responses as Record<string, unknown>,
              }))}
              templateFields={
                (trackerTemplate.fields as unknown as TrackerField[]) || []
              }
              dashboardMode={client.dashboardMode || "STANDARD"}
            />
          </div>
        )}

        {/* Weekly Review (only if tracker is set up) */}
        {trackerTemplate && (
          <div className="mb-6">
            <CoachReviewSection
              clientId={id}
              currentWeekStart={currentWeekStart}
              hasCheckInsThisWeek={thisWeekCheckIns > 0}
              initialReview={
                currentReview
                  ? {
                      id: currentReview.id,
                      weekStartDate: currentReview.weekStartDate.toISOString().split("T")[0],
                      status: currentReview.status,
                      synthesisData: currentReview.synthesisData as {
                        sections?: { title: string; content: string }[];
                        generationNote?: string;
                        generationError?: string;
                      } | null,
                      coachFeedback: currentReview.coachFeedback,
                      approvedAt: currentReview.approvedAt?.toISOString() || null,
                      deliveredAt: currentReview.deliveredAt?.toISOString() || null,
                    }
                  : null
              }
              pastReviews={pastReviews.map((pr) => ({
                id: pr.id,
                weekStartDate: pr.weekStartDate.toISOString().split("T")[0],
                status: pr.status,
              }))}
            />
          </div>
        )}

        {(bmi || whr) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {weightKg && (
              <div className="bg-white rounded-lg border border-stone-200 p-4">
                <p className="text-xs text-stone-500">Weight</p>
                <p className="text-lg font-semibold text-stone-900">
                  {weightKg} kg
                </p>
              </div>
            )}
            {bmi && (
              <div className="bg-white rounded-lg border border-stone-200 p-4">
                <p className="text-xs text-stone-500">BMI</p>
                <p className="text-lg font-semibold text-stone-900">{bmi}</p>
              </div>
            )}
            {whr && (
              <div className="bg-white rounded-lg border border-stone-200 p-4">
                <p className="text-xs text-stone-500">Waist-Hip Ratio</p>
                <p className="text-lg font-semibold text-stone-900">{whr}</p>
              </div>
            )}
            {responseMap?.stress_sleep?.stress_level != null && (
              <div className="bg-white rounded-lg border border-stone-200 p-4">
                <p className="text-xs text-stone-500">Stress Level</p>
                <p className="text-lg font-semibold text-stone-900">
                  {String(responseMap.stress_sleep.stress_level)}/10
                </p>
              </div>
            )}
          </div>
        )}

        {!submission ? (
          <div className="text-center py-16">
            <p className="text-stone-500">
              This client hasn't started their intake yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {intakeSections.map((section) => {
              const sectionData = responseMap[section.key];
              const hasData =
                !!sectionData && Object.keys(sectionData).length > 0;

              return (
                <CollapsibleSection
                  key={section.key}
                  title={section.title}
                  hasData={hasData}
                >
                  <dl className="space-y-3">
                    {section.questions.map((q) => {
                      const val = sectionData?.[q.key];
                      if (val === undefined || val === null || val === "")
                        return null;

                      return (
                        <div key={q.key}>
                          <dt className="text-xs text-stone-500">{q.label}</dt>
                          <dd className="text-sm text-stone-900 mt-0.5 whitespace-pre-wrap">
                            {Array.isArray(val)
                              ? val.join(", ")
                              : typeof val === "boolean"
                                ? val
                                  ? "Yes"
                                  : "No"
                                : String(val)}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                </CollapsibleSection>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
