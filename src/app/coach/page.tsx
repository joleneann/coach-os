import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function CoachDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "COACH") redirect("/");

  const clients = await prisma.user.findMany({
    where: { coachId: session.user.id },
    include: {
      intakeSubmissions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-stone-900">Coach OS</h1>
          <p className="text-sm text-stone-500">{session.user.name}</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-stone-900">
            Your Clients
          </h2>
          <span className="text-sm text-stone-500">
            {clients.length} client{clients.length !== 1 ? "s" : ""}
          </span>
        </div>

        {clients.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-stone-500 mb-2">No clients yet.</p>
            <p className="text-stone-400 text-sm">
              Share the registration link with your clients to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map((client) => {
              const intake = client.intakeSubmissions[0];
              const intakeStatus = intake
                ? intake.status === "COMPLETE"
                  ? "Intake complete"
                  : `Intake in progress (section ${intake.currentSection + 1}/10)`
                : "No intake started";

              return (
                <Link
                  key={client.id}
                  href={`/coach/clients/${client.id}`}
                  className="block bg-white rounded-lg border border-stone-200 p-4 hover:border-stone-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-stone-900">
                        {client.name}
                      </h3>
                      <p className="text-sm text-stone-500">{client.email}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block text-xs px-2 py-1 rounded-full ${
                          client.status === "ACTIVE"
                            ? "bg-green-50 text-green-700"
                            : client.status === "INTAKE"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {client.status || "New"}
                      </span>
                      <p className="text-xs text-stone-400 mt-1">
                        {intakeStatus}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
