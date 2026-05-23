"use client";

import { useState, useRef, useCallback, useEffect } from "react";

/**
 * VoiceRecorder
 *
 * Inline mic button for voice-to-text transcription.
 * Uses browser MediaRecorder → Groq Whisper via /api/voice/transcribe.
 *
 * Three states: idle → recording → transcribing
 * Stone/amber palette. Small, unobtrusive.
 */

interface Props {
  onTranscript: (text: string) => void;
  onAudioUrl?: (dataUrl: string) => void;
  maxDuration?: number; // seconds, default 60
  disabled?: boolean;
}

type RecordingState = "idle" | "recording" | "transcribing";

export default function VoiceRecorder({
  onTranscript,
  onAudioUrl,
  maxDuration = 60,
  disabled = false,
}: Props) {
  const [state, setState] = useState<RecordingState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });

      chunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        // Stop all tracks
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        transcribe(blob);
      };

      mediaRecorder.start(1000); // collect chunks every second
      setState("recording");
      setSeconds(0);

      // Timer
      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev + 1 >= maxDuration) {
            stopRecording();
            return prev + 1;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      setError("Microphone access denied. Check your browser permissions.");
    }
  }, [maxDuration]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const transcribe = useCallback(
    async (blob: Blob) => {
      setState("transcribing");

      // Convert to base64 for storage if callback provided
      if (onAudioUrl) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            onAudioUrl(reader.result);
          }
        };
        reader.readAsDataURL(blob);
      }

      try {
        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");

        const res = await fetch("/api/voice/transcribe", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Transcription failed.");
          setState("idle");
          return;
        }

        if (data.transcript) {
          onTranscript(data.transcript);
        }
        setState("idle");
      } catch {
        setError("Failed to transcribe. Please try again.");
        setState("idle");
      }
    },
    [onTranscript, onAudioUrl]
  );

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (disabled) return null;

  return (
    <div className="inline-flex items-center gap-2">
      {state === "idle" && (
        <button
          type="button"
          onClick={startRecording}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-500 border border-stone-300 rounded-lg hover:bg-stone-50 hover:text-stone-700 transition-colors"
          title="Record voice note"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
          Voice
        </button>
      )}

      {state === "recording" && (
        <div className="inline-flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
          <span className="text-xs text-amber-700 font-medium tabular-nums">
            {formatTime(seconds)}
          </span>
          <button
            type="button"
            onClick={stopRecording}
            className="px-2.5 py-1.5 text-xs font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors"
          >
            Stop
          </button>
        </div>
      )}

      {state === "transcribing" && (
        <div className="inline-flex items-center gap-2">
          <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-stone-500">Transcribing...</span>
        </div>
      )}

      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  );
}
