"use client";

import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface AudioToggleProps {
  feedbackMessages: string[];
}

export default function AudioToggle({ feedbackMessages }: AudioToggleProps) {
  const [enabled, setEnabled] = useState(false);
  const lastSpokenRef = useRef<string>("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!enabled || feedbackMessages.length === 0) return;
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const message = feedbackMessages[0];
    if (message === lastSpokenRef.current) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1.2;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
      lastSpokenRef.current = message;
    }, 300);
  }, [enabled, feedbackMessages]);

  useEffect(() => {
    if (feedbackMessages.length === 0) {
      lastSpokenRef.current = "";
    }
  }, [feedbackMessages]);

  return (
    <button
      onClick={() => setEnabled(!enabled)}
      className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
        enabled
          ? "bg-white text-zinc-900"
          : "bg-white/15 backdrop-blur-md text-white/60 hover:text-white/80"
      }`}
    >
      {enabled ? <Volume2 className="w-4.5 h-4.5" /> : <VolumeX className="w-4.5 h-4.5" />}
    </button>
  );
}
