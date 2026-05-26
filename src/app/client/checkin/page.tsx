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
  CosWeekLabels,
  CosMeta,
  CosRule,
  EditIcon,
  BackIcon,
  MicIcon,
  ArrowIcon,
} from "@/components/cos";
import { CwShell, CwContainer } from "@/components/cw";

/**
 * Daily check-in page.
 *
 * Two layouts in the same route:
 *   Mobile (≤md): Warm hero from checkin.jsx · CheckinWarm. Pulse is the
 *     gravity well; "Write instead" opens a Sheet with a textarea.
 *   Desktop (≥md): ClientWebCheckin from client-web.jsx. Writing primary,
 *     voice equal · single card with textarea, footer with word count,
 *     Hold-to-speak pill, and Send to Jolene action.
 *
 * Voice recorder UI lives in the next pass; the Hold-to-speak button is
 * a placeholder that nudges to use writing for now.
 */
export default function CheckinPage() {
  const router = useRouter();
  const [writeOpen, setWriteOpen] = useState(false);
  const [reflection, setReflection] = useState("");
  const [saving, setSaving] = useState(false);

  const today = new Date();
  const dayLabel = today
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
    .toUpperCase()
    .replace(",", " ·");
  const todayIso = today.toLocaleDateString("en-CA");

  const wordCount = reflection.trim() === ""
    ? 0
    : reflection.trim().split(/\s+/).length;

  async function submit(text: string) {
    if (!text.trim()) {
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
          responses: { reflection: text.trim() },
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

  function holdToSpeakHint() {
    toast("Voice recorder arrives in the next pass", {
      description: "For now, write below.",
    });
  }

  return (
    <>
      {/* ── Mobile · Warm hero ─────────────────────────────── */}
      <div className="md:hidden min-h-screen w-full bg-paper text-ink flex flex-col">
        <header className="px-6 pt-4">
          <Link
            href="/client"
            className="inline-flex items-center gap-1.5 text-meta text-quiet hover:text-ink transition-colors"
          >
            <BackIcon size={14} />
            Today
          </Link>
        </header>

        <div className="px-6 pt-6 max-w-md mx-auto w-full">
          <div className="flex items-center justify-between">
            <CosMeta>{dayLabel}</CosMeta>
            <CosWeekDots data={[1, 1, 1, 0, 1, 0, 0]} today={4} />
          </div>
        </div>

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

        <div className="flex-1 grid place-items-center mt-14 px-6">
          <div className="flex flex-col items-center">
            <CkBreathPulse size={184} onTap={holdToSpeakHint} />
            <p className="text-body-2 text-ink-2 mt-7">Tap to begin</p>
            <p className="text-meta text-hush mt-1">or hold for hands-free</p>
          </div>
        </div>

        <div className="pb-10 pt-8 px-6 grid place-items-center">
          <Button variant="neutral" size="md" onClick={() => setWriteOpen(true)}>
            <EditIcon size={15} />
            Write instead
          </Button>
        </div>
      </div>

      {/* ── Desktop · writing primary, voice equal ─────────── */}
      <div className="hidden md:block">
        <CwShell activeOverride="today">
          <CwContainer max={820} className="py-14">
            <CosMeta>{dayLabel}</CosMeta>
            <h1
              className="text-ink font-medium tracking-tight mt-2"
              style={{ fontSize: 42, lineHeight: 1.1 }}
            >
              Tell us about today.
            </h1>
            <p className="text-body text-quiet mt-2.5">
              Voice, writing, or both. Whatever lands.
            </p>

            <div className="mt-8 p-7 rounded-[18px] bg-card border border-line flex flex-col min-h-[320px]">
              <Textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Start writing, or hold the mic to speak."
                className="flex-1 min-h-[200px] text-read-lead text-ink placeholder:text-hush border-0 px-0 py-0 resize-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
              />
              <div className="mt-4 pt-4 border-t border-line flex items-center justify-between">
                <span className="text-meta text-hush">
                  {wordCount} {wordCount === 1 ? "word" : "words"} · saves as
                  you type
                </span>
                <div className="flex items-center gap-2.5">
                  <Button
                    variant="soft"
                    size="md"
                    type="button"
                    onClick={holdToSpeakHint}
                  >
                    <MicIcon size={15} />
                    Hold to speak
                  </Button>
                  <Button
                    variant="accent"
                    size="md"
                    type="button"
                    onClick={() => submit(reflection)}
                    disabled={saving}
                  >
                    {saving ? "Sending..." : "Send to Jolene"}
                    {!saving && <ArrowIcon size={14} />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <CosRule />
              <div className="mt-6 grid grid-cols-2 gap-6">
                <div>
                  <CosMeta>YESTERDAY, IN YOUR WORDS</CosMeta>
                  <p className="text-body text-ink-2 italic mt-2.5 leading-relaxed">
                    Yesterday&apos;s reflection appears here once you have a
                    week of check-ins behind you.
                  </p>
                </div>
                <div>
                  <CosMeta>THIS WEEK</CosMeta>
                  <div className="mt-3.5 flex justify-between items-center">
                    <CosWeekLabels />
                    <CosWeekDots
                      data={[1, 1, 1, 0, 1, 0, 0]}
                      today={4}
                      size={9}
                      gap={8}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CwContainer>
        </CwShell>
      </div>

      {/* Mobile writing Sheet · shared state */}
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
              {wordCount === 0
                ? "0 words"
                : `${wordCount} ${wordCount === 1 ? "word" : "words"}`}
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
              onClick={() => submit(reflection)}
              disabled={saving}
            >
              {saving ? "Sending..." : "Send to your coach"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
