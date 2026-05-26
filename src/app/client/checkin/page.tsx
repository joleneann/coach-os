"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  CkBreathPulse,
  CosWeekDots,
  CosMeta,
  EditIcon,
  BackIcon,
} from "@/components/cos";

/**
 * Daily check-in · Warm variant.
 *
 * Ports docs/design/design_files/checkin.jsx · CheckinWarm.
 * Phone-first hero. Voice as the gravity well, writing as the calm alternative.
 * The actual voice recorder UI is its own state machine (to be ported in
 * the next pass); for now the pulse opens an "arrives next" hint and the
 * Write instead pill opens a journal sheet that POSTs to /api/checkin.
 */
export default function CheckinPage() {
  const router = useRouter();
  const [writeOpen, setWriteOpen] = useState(false);
  const [reflection, setReflection] = useState("");
  const [saving, setSaving] = useState(false);

  const today = new Date();
  const dayLabel = today
    .toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    .toUpperCase()
    .replace(",", " ·");
  const todayIso = today.toLocaleDateString("en-CA"); // YYYY-MM-DD

  async function handleSubmit() {
    if (!reflection.trim()) {
      toast("Nothing to send yet", {
        description: "Write a sentence or two, then try again.",
      });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: todayIso,
          responses: { reflection: reflection.trim() },
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not save");
      }
      toast("Sent", {
        description: "Your coach will see this on their next pass.",
      });
      setWriteOpen(false);
      setReflection("");
      router.push("/client");
      router.refresh();
    } catch (err) {
      toast("Something went wrong", {
        description: String(err instanceof Error ? err.message : err),
      });
    } finally {
      setSaving(false);
    }
  }

  function handlePulseTap() {
    toast("Voice recorder arrives in the next pass", {
      description: "For now, tap Write instead.",
    });
  }

  return (
    <div className="min-h-screen w-full bg-paper text-ink flex flex-col">
      {/* Top bar · small back affordance, no chrome */}
      <header className="px-6 pt-4">
        <Link
          href="/client"
          className="inline-flex items-center gap-1.5 text-meta text-quiet hover:text-ink transition-colors"
        >
          <BackIcon size={14} />
          Today
        </Link>
      </header>

      {/* Header · date eyebrow + week dots */}
      <div className="px-6 pt-6 max-w-md mx-auto w-full">
        <div className="flex items-center justify-between">
          <CosMeta>{dayLabel}</CosMeta>
          <CosWeekDots data={[1, 1, 1, 0, 1, 0, 0]} today={4} />
        </div>
      </div>

      {/* Composed question */}
      <div className="px-7 pt-8 max-w-md mx-auto w-full">
        <h1 className="text-display">
          Tell us
          <br />
          about today.
        </h1>
        <p className="text-body text-quiet mt-3">
          Voice, writing, or both. Whatever lands.
        </p>
      </div>

      {/* Pulse */}
      <div className="flex-1 grid place-items-center mt-14 px-6">
        <div className="flex flex-col items-center">
          <CkBreathPulse size={184} onTap={handlePulseTap} />
          <p className="text-body-2 text-ink-2 mt-7">Tap to begin</p>
          <p className="text-meta text-hush mt-1">or hold for hands-free</p>
        </div>
      </div>

      {/* Write instead · pill button anchored above the safe area */}
      <div className="pb-10 pt-8 px-6 grid place-items-center">
        <Button
          variant="neutral"
          size="md"
          onClick={() => setWriteOpen(true)}
        >
          <EditIcon size={15} />
          Write instead
        </Button>
      </div>

      {/* Writing sheet */}
      <Sheet open={writeOpen} onOpenChange={setWriteOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-[20px] max-h-[88vh] bg-paper border-line"
        >
          <SheetHeader className="px-6 pt-2">
            <CosMeta>{dayLabel}</CosMeta>
            <SheetTitle className="text-h1 font-medium tracking-tight mt-1">
              A few sentences, when you&apos;re ready.
            </SheetTitle>
            <SheetDescription className="text-body text-quiet">
              Not what you did. What you noticed.
            </SheetDescription>
          </SheetHeader>

          <div className="px-6 mt-3">
            <Textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Start writing..."
              rows={9}
              className="min-h-[220px] bg-card border-line text-ink text-body resize-none rounded-2xl px-4 py-3 focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-0"
            />
            <p className="text-meta text-hush mt-2">
              {reflection.trim().length === 0
                ? "0 words"
                : `${reflection.trim().split(/\s+/).length} words`}
            </p>
          </div>

          <SheetFooter className="px-6 pb-6 flex-row justify-between gap-3">
            <Button
              variant="quiet"
              size="md"
              onClick={() => setWriteOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="accent"
              size="md"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Sending..." : "Send to your coach"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
