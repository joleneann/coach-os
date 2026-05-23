import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import WeeklyReviewCard from "@/components/WeeklyReviewCard";
import { formatWeekRange, getWeekEndDate } from "@/lib/weekly-review";

/**
 * Client Review Page
 *
 * Shows the latest DELIVERED weekly review.
 * Simple, warm, read-only. The coach's letter to the client.
 */
export default async function ClientReviewPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CLIENT") redirect("/");

  // Fetch the latest delivered review
  const review = await prisma.weeklyReview.findFirst({
    where: {
      clientId: session.user.id,
      status: "DELIVERED",
    },
    orderBy: { weekStartDate: "desc" },
  });

  // Fetch all delivered reviews for the list
  const allReviews = await prisma.weeklyReview.findMany({
    where: {
      clientId: session.user.id,
      status: "DELIVERED",
    },
    select: { id: true, weekStartDate: true, deliveredAt: true },
    orderBy: { weekStartDate: "desc" },
  });

  const weekStart = review
    ? review.weekStartDate.toISOString().split("T")[0]
    : null;
  const weekEnd = weekStart ? getWeekEndDate(weekStart) : null;
  const weekLabel =
    weekStart && weekEnd ? formatWeekRange(weekStart, weekEnd) : "";

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/client"
              className="text-stone-400 hover:text-stone-600 text-sm"
            >
              &larr; Dashboard
            </Link>
            <h1 className="text-lg font-semibold text-stone-900">
              Your Week in Review
            </h1>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {review && weekStart ? (
          <div className="space-y-8">
            <WeeklyReviewCard
              review={{
                id: review.id,
                weekStartDate: weekStart,
                status: review.status,
                synthesisData: review.synthesisData as {
                  sections?: { title: string; content: string }[];
                } | null,
                coachFeedback: review.coachFeedback,
                approvedAt: review.approvedAt?.toISOString() || null,
                deliveredAt: review.deliveredAt?.toISOString() || null,
              }}
              weekLabel={weekLabel}
              mode="client"
            />

            {/* Past reviews list */}
            {allReviews.length > 1 && (
              <div>
                <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">
                  Previous reviews
                </h3>
                <div className="space-y-2">
                  {allReviews.slice(1).map((pr) => {
                    const prStart = pr.weekStartDate
                      .toISOString()
                      .split("T")[0];
                    const prEnd = getWeekEndDate(prStart);
                    const prLabel = formatWeekRange(prStart, prEnd);
                    return (
                      <div
                        key={pr.id}
                        className="flex items-center justify-between p-3 bg-white border border-stone-200 rounded-lg"
                      >
                        <span className="text-sm text-stone-600">
                          Week of {prLabel}
                        </span>
                        <span className="text-xs text-stone-400">
                          {pr.deliveredAt
                            ? new Date(pr.deliveredAt).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" }
                              )
                            : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-stone-200 p-8 text-center">
            <p className="text-stone-600 text-sm">
              Your coach will share your first weekly review soon.
            </p>
            <p className="text-stone-400 text-xs mt-2">
              Keep checking in daily. Your review will appear here.
            </p>
            <Link
              href="/client"
              className="inline-block mt-6 px-4 py-2 border border-stone-300 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-100 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
