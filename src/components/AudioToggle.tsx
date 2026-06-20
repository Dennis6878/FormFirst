"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";

const GOOD_PHRASES = ["Good", "Nice", "Keep going", "Perfect", "Great form", "Solid"];

interface AudioToggleProps {
  feedbackMessages: string[];
  repCount: number;
}

export default function AudioToggle({ feedbackMessages, repCount }: AudioToggleProps) {
  const [enabled, setEnabled] = useState(false);
  const lastRepSpokenRef = useRef(0);
  const phraseIndexRef = useRef(0);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.volume = 0.9;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }, []);

  // Speak feedback after each rep
  useEffect(() => {
    if (!enabled || repCount === 0 || repCount === lastRepSpokenRef.current) return;
    lastRepSpokenRef.current = repCount;

    const errorMessages = feedbackMessages.filter((m) => m !== "Good rep!");
    if (errorMessages.length > 0) {
      speak(errorMessages[0]);
    } else {
      const phrase = GOOD_PHRASES[phraseIndexRef.current % GOOD_PHRASES.length];
      phraseIndexRef.current++;
      speak(phrase);
    }
  }, [enabled, repCount, feedbackMessages, speak]);

  // Speak live critical errors immediately
  useEffect(() => {
    if (!enabled || feedbackMessages.length === 0) return;
    const criticalErrors = feedbackMessages.filter(
      (m) => m === "Knees caving in" || m === "Shift weight to center"
    );
    if (criticalErrors.length > 0) {
      speak(criticalErrors[0]);
    }
  }, [enabled, feedbackMessages, speak]);

  return (
    <button
      onClick={() => setEnabled(!enabled)}
      className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
        enabled
          ? "bg-white text-zinc-900"
          : "bg-white/15 backdrop-blur-md text-white/60 hover:text-white/80"
      }`}
    >
      {enabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
    </button>
  );
}
