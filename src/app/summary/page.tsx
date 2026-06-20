"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkout } from "@/context/WorkoutContext";
import { CheckCircle2, AlertTriangle, Sparkles, ArrowRight } from "lucide-react";

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
  const score = totalReps > 0 ? Math.round((goodReps / totalReps) * 100) : 0;

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
      <div className="flex flex-col items-center justify-center h-full px-8 text-center bg-background">
        <div className="w-14 h-14 rounded-full bg-surface border border-border flex items-center justify-center mb-4">
          <span className="text-2xl">🏋️</span>
        </div>
        <p className="text-foreground font-semibold text-[16px] mb-1">No reps recorded</p>
        <p className="text-muted text-[13px] mb-6">Make sure the camera can see your full body.</p>
        <button onClick={handleDone} className="h-10 px-6 rounded-lg bg-foreground text-white text-[13px] font-medium">
          Back to Exercises
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with score */}
      <div className="bg-foreground text-white px-5 pt-16 pb-6 rounded-b-[2rem]">
        <p className="text-zinc-400 text-[13px] mb-1 capitalize">{currentExercise} Session</p>
        <h1 className="text-[24px] font-bold tracking-tight mb-5">Workout Complete</h1>
        <div className="flex gap-2.5">
          <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
            <div className="text-[28px] font-bold leading-none">{totalReps}</div>
            <div className="text-[10px] text-zinc-400 mt-1 font-medium">Total Reps</div>
          </div>
          <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
            <div className="text-[28px] font-bold leading-none text-emerald-400">{goodReps}</div>
            <div className="text-[10px] text-zinc-400 mt-1 font-medium">Good Form</div>
          </div>
          <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
            <div className="text-[28px] font-bold leading-none">{score}%</div>
            <div className="text-[10px] text-zinc-400 mt-1 font-medium">Score</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-4">
        {/* Rep breakdown */}
        <div className="mb-5">
          <h2 className="text-[12px] font-semibold text-muted uppercase tracking-wider mb-2.5">Rep Breakdown</h2>
          <div className="bg-surface border border-border rounded-xl p-3">
            <div className="space-y-1.5">
              {repLogs.map((log) => (
                <div key={log.repNumber} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2.5">
                    {log.errors.length === 0 ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-warning" />
                    )}
                    <span className="text-[13px] font-medium text-foreground">Rep {log.repNumber}</span>
                  </div>
                  {log.errors.length === 0 ? (
                    <span className="text-[11px] font-medium text-success">Good</span>
                  ) : (
                    <div className="flex gap-1">
                      {log.errors.map((err) => (
                        <span key={err} className="text-[10px] font-medium text-warning bg-orange-50 px-2 py-0.5 rounded-md">
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
          <div className="mb-5">
            <h2 className="text-[12px] font-semibold text-muted uppercase tracking-wider mb-2.5">AI Coaching</h2>
            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-foreground">Focus Area</div>
                  <div className="text-[11px] text-muted">{mostCommonMistake}</div>
                </div>
              </div>
              {isLoadingFeedback ? (
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
                  <span className="text-[12px] text-muted">Generating feedback...</span>
                </div>
              ) : (
                <p className="text-[13px] text-muted leading-relaxed">{aiFeedback}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Done */}
      <div className="flex-shrink-0 border-t border-border bg-background px-5 py-3.5">
        <button
          onClick={handleDone}
          className="w-full h-11 rounded-lg bg-foreground text-white font-medium text-[14px] hover:bg-foreground/90 transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
        >
          Done
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
