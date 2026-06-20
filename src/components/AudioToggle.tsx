"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

const GOOD_PHRASES = ["Good", "Nice", "Keep going", "Perfect", "Great form", "Solid"];

interface AudioToggleProps {
  feedbackMessages: string[];
  repCount: number;
}

export default function AudioToggle({ feedbackMessages, repCount }: AudioToggleProps) {
  const [enabled, setEnabled] = useState(false);
  const lastRepRef = useRef(0);
  const phraseIdx = useRef(0);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.1;
    u.volume = 0.9;
    window.speechSynthesis.speak(u);
  }, []);

  useEffect(() => {
    if (!enabled || repCount === 0 || repCount === lastRepRef.current) return;
    lastRepRef.current = repCount;

    const errors = feedbackMessages.filter((m) => m !== "Good rep!");
    if (errors.length > 0) {
      speak(errors[0]);
    } else {
      speak(GOOD_PHRASES[phraseIdx.current++ % GOOD_PHRASES.length]);
    }
  }, [enabled, repCount, feedbackMessages, speak]);

  return (
    <button
      onClick={() => setEnabled(!enabled)}
      className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
        enabled ? "bg-white text-zinc-900" : "bg-white/15 backdrop-blur-md text-white/60"
      }`}
    >
      {enabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
    </button>
  );
}
