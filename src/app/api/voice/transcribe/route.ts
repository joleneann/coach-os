import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * POST /api/voice/transcribe
 *
 * Accepts an audio blob (WebM/opus from browser MediaRecorder),
 * sends it to Groq Whisper Large v3 Turbo for transcription.
 *
 * Auth: CLIENT or COACH (any authenticated user).
 * Body: FormData with "audio" file field.
 * Returns: { transcript: string }
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return NextResponse.json(
      { error: "Voice input is not configured. GROQ_API_KEY is missing." },
      { status: 503 }
    );
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio");

    if (!audioFile || !(audioFile instanceof File)) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Validate size (max 2MB for short voice notes)
    if (audioFile.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Audio file too large. Keep recordings under 2 minutes." },
        { status: 400 }
      );
    }

    // Send to Groq Whisper
    const groqForm = new FormData();
    groqForm.append("file", audioFile, "recording.webm");
    groqForm.append("model", "whisper-large-v3-turbo");
    groqForm.append("response_format", "text");

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: groqForm,
      }
    );

    if (!groqRes.ok) {
      const errorText = await groqRes.text();
      console.error("Groq Whisper error:", groqRes.status, errorText);
      return NextResponse.json(
        { error: "Transcription failed. Please try again." },
        { status: 502 }
      );
    }

    const transcript = (await groqRes.text()).trim();

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error("Voice transcribe error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
