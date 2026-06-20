"use client";

import { useState, useEffect, useRef } from "react";

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
      className={`w-[48px] h-[48px] rounded-full flex items-center justify-center transition-all shadow-lg ${
        enabled
          ? "bg-white text-primary"
          : "bg-white/20 backdrop-blur-md text-white/70"
      }`}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        {enabled ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.757 3.63 8.25 4.51 8.25H6.75z" />
        )}
      </svg>
    </button>
  );
}
