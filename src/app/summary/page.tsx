"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkout } from "@/context/WorkoutContext";

export default function SummaryPage() {
  const router = useRouter();
  const { repLogs, currentExercise, clearCurrentSession } = useWorkout();
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  const totalReps = repLogs.length;
  const goodReps = repLogs.filter((r) => r.errors.length === 0).length;

  const errorCounts: Record<string, number> = {};
  for (const log of repLogs) {
    for (const err of log.errors) {
      errorCounts[err] = (errorCounts[err] || 0) + 1;
    }
  }
  const mostCommonMistake = Object.entries(errorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  useEffect(() => {
    if (!mostCommonMistake || totalReps === 0) return;

    setIsLoadingFeedback(true);
    fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mistake: mostCommonMistake, repCount: totalReps }),
    })
      .then((res) => res.json())
      .then((data) => setAiFeedback(data.feedback))
      .catch(() => setAiFeedback("Could not load AI feedback."))
      .finally(() => setIsLoadingFeedback(false));
  }, [mostCommonMistake, totalReps]);

  const handleDone = () => {
    clearCurrentSession();
    router.push("/exercises");
  };

  if (totalReps === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center">
        <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
          <span className="text-3xl">🏋️</span>
        </div>
        <p className="text-foreground font-semibold mb-1">No reps recorded</p>
        <p className="text-muted text-sm mb-6">Try again and make sure the camera can see your full body.</p>
        <button onClick={handleDone} className="text-primary font-semibold text-sm">
          Back to Exercises
        </button>
      </div>
    );
  }

  const score = Math.round((goodReps / totalReps) * 100);

  return (
    <div className="flex flex-col h-full px-5 pt-16 pb-6 bg-background">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary-light/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl font-bold text-primary">{score}%</span>
        </div>
        <h1 className="text-[22px] font-bold text-foreground tracking-tight">Workout Complete</h1>
        <p className="text-[13px] text-muted mt-1 capitalize">{currentExercise ?? "Exercise"} Session</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        <div className="bg-surface rounded-2xl p-3.5 text-center">
          <div className="text-[22px] font-bold text-foreground">{totalReps}</div>
          <div className="text-[10px] text-muted uppercase tracking-wider mt-0.5 font-medium">Total</div>
        </div>
        <div className="bg-surface rounded-2xl p-3.5 text-center">
          <div className="text-[22px] font-bold text-success">{goodReps}</div>
          <div className="text-[10px] text-muted uppercase tracking-wider mt-0.5 font-medium">Good</div>
        </div>
        <div className="bg-surface rounded-2xl p-3.5 text-center">
          <div className="text-[22px] font-bold text-warning">{totalReps - goodReps}</div>
          <div className="text-[10px] text-muted uppercase tracking-wider mt-0.5 font-medium">Fix</div>
        </div>
      </div>

      {/* Rep breakdown */}
      <div className="mb-6">
        <h2 className="text-[12px] font-semibold text-foreground uppercase tracking-wider mb-3">Rep Breakdown</h2>
        <div className="bg-surface rounded-2xl p-4 max-h-40 overflow-y-auto">
          <div className="space-y-2.5">
            {repLogs.map((log) => (
              <div key={log.repNumber} className="flex items-center gap-3">
                <span className="text-[12px] text-muted w-10 flex-shrink-0 font-medium">#{log.repNumber}</span>
                {log.errors.length === 0 ? (
                  <span className="text-[11px] font-medium text-success bg-success/8 px-2.5 py-1 rounded-lg">
                    Good form
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {log.errors.map((err) => (
                      <span key={err} className="text-[11px] font-medium text-warning bg-warning/8 px-2.5 py-1 rounded-lg">
                        {err}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Feedback */}
      {mostCommonMistake && (
        <div className="mb-6">
          <h2 className="text-[12px] font-semibold text-foreground uppercase tracking-wider mb-3">AI Coaching</h2>
          <div className="bg-gradient-to-br from-primary/[0.04] to-primary-light/[0.06] rounded-2xl p-4 border border-primary/10">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <span className="text-[12px] font-semibold text-primary">
                Focus: {mostCommonMistake}
              </span>
            </div>
            {isLoadingFeedback ? (
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-[12px] text-muted">Generating feedback...</span>
              </div>
            ) : (
              <p className="text-[13px] text-slate-600 leading-relaxed">{aiFeedback}</p>
            )}
          </div>
        </div>
      )}

      {/* Done button */}
      <div className="mt-auto">
        <button
          onClick={handleDone}
          className="w-full h-[54px] rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white font-semibold text-[15px] shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
        >
          Done
        </button>
      </div>
    </div>
  );
}
