import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { intakeSections } from "@/lib/intake-schema";
import Link from "next/link";

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

  // Calculate BMI if we have height and weight
  const height = responseMap?.basic_info?.height as string | undefined;
  const weight = responseMap?.basic_info?.weight as string | undefined;
  const heightM = height ? parseFloat(height) / 100 : null;
  const weightKg = weight ? parseFloat(weight) : null;
  const bmi =
    heightM && weightKg ? (weightKg / (heightM * heightM)).toFixed(1) : null;

  // Waist-hip ratio
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
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Quick stats */}
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
            {responseMap?.stress_sleep?.stress_level && (
              <div className="bg-white rounded-lg border border-stone-200 p-4">
                <p className="text-xs text-stone-500">Stress Level</p>
                <p className="text-lg font-semibold text-stone-900">
                  {responseMap.stress_sleep.stress_level as string}/10
                </p>
              </div>
            )}
          </div>
        )}

        {/* Intake sections */}
        {!submission ? (
          <div className="text-center py-16">
            <p className="text-stone-500">
              This client hasn't started their intake yet.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {intakeSections.map((section) => {
              const sectionData = responseMap[section.key];
              if (!sectionData || Object.keys(sectionData).length === 0) {
                return (
                  <div
                    key={section.key}
                    className="bg-white rounded-lg border border-stone-200 p-6"
                  >
                    <h2 className="text-base font-semibold text-stone-900 mb-1">
                      {section.title}
                    </h2>
                    <p className="text-sm text-stone-400">
                      Not yet completed
                    </p>
                  </div>
                );
              }

              return (
                <div
                  key={section.key}
                  className="bg-white rounded-lg border border-stone-200 p-6"
                >
                  <h2 className="text-base font-semibold text-stone-900 mb-4">
                    {section.title}
                  </h2>
                  <dl className="space-y-3">
                    {section.questions.map((q) => {
                      const val = sectionData[q.key];
                      if (val === undefined || val === null || val === "")
                        return null;

                      return (
                        <div key={q.key}>
                          <dt className="text-xs text-stone-500">{q.label}</dt>
                          <dd className="text-sm text-stone-900 mt-0.5 whitespace-pre-wrap">
                            {Array.isArray(val) ? val.join(", ") : String(val)}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
