"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import PlanContent from "@/components/PlanContent";

interface PlanSection {
  id: string;
  sectionType: string;
  content: string;
  order: number;
}

const sectionTitles: Record<string, string> = {
  summary_card: "Summary Card",
  coaching_cycle: "Your Coaching Cycle",
  starting_point: "Your Starting Point",
  behavior_ecosystem: "Your Behavior Ecosystem",
  nutrition: "Nutrition",
  exercise: "Exercise",
  lifestyle: "Lifestyle & Environment",
  mental_health: "Stress & Mental Health",
  blood_report: "Blood Report",
  gut_health: "Gut Health",
  supplementation: "Supplementation",
  referrals: "Referrals",
  what_happens_next: "What Happens Next",
};

export default function ClientPlanPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<PlanSection[]>([]);
  const [planExists, setPlanExists] = useState(false);

  useEffect(() => {
    async function load() {
      if (!session?.user?.id) return;
      try {
        const res = await fetch(
          `/api/plan/view?clientId=${session.user.id}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.planId) {
          setPlanExists(true);
          setSections(data.sections || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [session?.user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-500">Loading your plan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/client"
              className="text-stone-400 hover:text-stone-600 text-sm"
            >
              ← Dashboard
            </Link>
            <h1 className="text-lg font-semibold text-stone-900">
              Your Plan
            </h1>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {!planExists ? (
          <div className="text-center py-16">
            <p className="text-stone-500 mb-2">
              Your plan is being prepared by your coach.
            </p>
            <p className="text-stone-400 text-sm">
              You&apos;ll be notified when it&apos;s ready to view.
            </p>
            <Link
              href="/client"
              className="inline-block mt-6 px-4 py-2 text-sm border border-stone-300 rounded-lg hover:bg-stone-100"
            >
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {sections
              .sort((a, b) => a.order - b.order)
              .map((section) => (
                <div
                  key={section.id}
                  className="bg-white border border-stone-200 rounded-lg"
                >
                  <div className="px-6 py-4 border-b border-stone-100">
                    <h2 className="text-sm font-semibold text-stone-900">
                      {sectionTitles[section.sectionType] ||
                        section.sectionType}
                    </h2>
                  </div>
                  <div className="px-6 py-4">
                    <PlanContent content={section.content} />
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
