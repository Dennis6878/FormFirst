"use client";

import { CheckCircle2, AlertTriangle } from "lucide-react";

interface RepCounterProps {
  repCount: number;
  feedbackMessages: string[];
  phase: string;
  hasError: boolean;
}

export default function RepCounter({ repCount, feedbackMessages, hasError }: RepCounterProps) {
  const isGood = feedbackMessages.length === 1 && feedbackMessages[0] === "Good rep!";
  const hasMessages = feedbackMessages.length > 0;

  return (
    <>
      {/* Rep counter - top left */}
      <div className="absolute top-5 left-4 pointer-events-none">
        <div className="bg-black/50 backdrop-blur-xl rounded-2xl px-5 py-3 text-center">
          <div className="text-[40px] font-bold text-white tabular-nums leading-none">{repCount}</div>
          <div className="text-[8px] text-white/40 uppercase tracking-[0.2em] mt-1 font-medium">Reps</div>
        </div>
      </div>

      {/* Feedback overlay - center of screen */}
      {hasMessages && (
        <div className="absolute inset-x-0 top-[35%] flex justify-center pointer-events-none px-8">
          <div
            className={`rounded-2xl px-6 py-5 text-center min-w-[200px] backdrop-blur-xl transition-all ${
              isGood
                ? "bg-emerald-500/90 shadow-2xl shadow-emerald-500/30"
                : "bg-red-500/90 shadow-2xl shadow-red-500/30"
            }`}
          >
            <div className="flex justify-center mb-2">
              {isGood ? (
                <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={2.5} />
              ) : (
                <AlertTriangle className="w-8 h-8 text-white" strokeWidth={2.5} />
              )}
            </div>
            {feedbackMessages.map((msg) => (
              <div key={msg} className="text-white text-[18px] font-bold leading-snug">
                {msg}
              </div>
            ))}
            {!isGood && (
              <div className="text-white/60 text-[11px] mt-1.5 font-medium">
                Fix on next rep
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
