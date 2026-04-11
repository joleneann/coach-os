import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default async function ClientDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CLIENT") redirect("/");

  const submission = await prisma.intakeSubmission.findFirst({
    where: { clientId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const intakeComplete = submission?.status === "COMPLETE";

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-stone-900">Coach OS</h1>
          <div className="flex items-center gap-4">
            <p className="text-sm text-stone-500">
              Hi, {session.user.name?.split(" ")[0]}
            </p>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {!intakeComplete ? (
          <div className="bg-white rounded-lg border border-stone-200 p-8 text-center">
            <h2 className="text-xl font-semibold text-stone-900 mb-3">
              Welcome!
            </h2>
            <p className="text-stone-600 mb-6 max-w-md mx-auto">
              Before your coach can create your personalized plan, we need to
              learn about you. This intake covers your health, habits, goals,
              and preferences.
            </p>
            <p className="text-stone-400 text-sm mb-6">
              It takes about 30-45 minutes. You can save and come back anytime.
            </p>
            <Link
              href="/intake"
              className="inline-block px-6 py-3 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors"
            >
              {submission ? "Continue Intake" : "Start Intake"}
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-stone-200 p-6">
              <h2 className="text-lg font-semibold text-stone-900 mb-2">
                Intake Complete
              </h2>
              <p className="text-stone-600 text-sm">
                Your coach is reviewing your responses and working on your
                personalized plan. You'll be notified when it's ready.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
