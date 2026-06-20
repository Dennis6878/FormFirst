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
        <p className="text-muted text-base mb-4">No reps recorded this session.</p>
        <button onClick={handleDone} className="text-primary font-semibold text-sm">
          Back to Exercises
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full px-5 pt-14 pb-6">
      <h1 className="text-2xl font-bold text-foreground mb-1">Workout Summary</h1>
      <p className="text-sm text-muted mb-6 capitalize">{currentExercise ?? "Exercise"} Session</p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-card border border-card-border rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{totalReps}</div>
          <div className="text-[10px] text-muted uppercase tracking-wider mt-0.5">Total Reps</div>
        </div>
        <div className="bg-card border border-card-border rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-success">{goodReps}</div>
          <div className="text-[10px] text-muted uppercase tracking-wider mt-0.5">Good Form</div>
        </div>
        <div className="bg-card border border-card-border rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-warning">{totalReps - goodReps}</div>
          <div className="text-[10px] text-muted uppercase tracking-wider mt-0.5">Needs Work</div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-3">Rep Breakdown</h2>
        <div className="bg-card border border-card-border rounded-2xl p-4 max-h-44 overflow-y-auto">
          <div className="space-y-2">
            {repLogs.map((log) => (
              <div key={log.repNumber} className="flex items-center gap-3">
                <span className="text-xs text-muted w-12 flex-shrink-0">Rep {log.repNumber}</span>
                {log.errors.length === 0 ? (
                  <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
                    Good form
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {log.errors.map((err) => (
                      <span key={err} className="text-xs font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">
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

      {mostCommonMistake && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">AI Form Coaching</h2>
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Most common: {mostCommonMistake}
              </span>
            </div>
            {isLoadingFeedback ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-muted">Generating feedback...</span>
              </div>
            ) : (
              <p className="text-sm text-foreground leading-relaxed">{aiFeedback}</p>
            )}
          </div>
        </div>
      )}

      <div className="mt-auto">
        <button
          onClick={handleDone}
          className="w-full h-14 rounded-2xl bg-primary text-white font-semibold text-base hover:bg-primary-light transition-colors active:scale-[0.98]"
        >
          Done
        </button>
      </div>
    </div>
  );
}
