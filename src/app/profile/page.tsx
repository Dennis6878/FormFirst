"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useWorkout } from "@/context/WorkoutContext";

export default function ProfilePage() {
  const { userName, email, exercisesUnlocked, unlockExercises } = useAuth();
  const { sessionHistory } = useWorkout();
  const [unlockCode, setUnlockCode] = useState("");

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlockCode.trim()) {
      unlockExercises();
      toast.success("Code Accepted!", { description: "3 new exercises have been unlocked." });
      setUnlockCode("");
    }
  };

  const totalSessions = sessionHistory.length;
  const totalReps = sessionHistory.reduce((sum, s) => sum + s.totalReps, 0);

  return (
    <div className="flex flex-col h-full px-5 pt-16 pb-4 bg-background">
      <h1 className="text-[26px] font-bold text-foreground tracking-tight mb-7">Profile</h1>

      {/* User card */}
      <div className="bg-surface rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-md shadow-primary/20">
            <span className="text-xl font-bold text-white">
              {(userName || "U")[0].toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-[16px] font-semibold text-foreground">{userName || "User"}</h2>
            <p className="text-[12px] text-muted mt-0.5">{email || "user@example.com"}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-surface rounded-2xl p-4 text-center">
          <div className="text-[24px] font-bold text-foreground">{totalSessions}</div>
          <div className="text-[10px] text-muted uppercase tracking-wider mt-0.5 font-medium">Sessions</div>
        </div>
        <div className="bg-surface rounded-2xl p-4 text-center">
          <div className="text-[24px] font-bold text-foreground">{totalReps}</div>
          <div className="text-[10px] text-muted uppercase tracking-wider mt-0.5 font-medium">Total Reps</div>
        </div>
      </div>

      {/* Unlock */}
      <div className="bg-surface rounded-2xl p-5 mb-5">
        <h3 className="text-[14px] font-semibold text-foreground mb-1">Physio Unlock Code</h3>
        <p className="text-[12px] text-muted mb-3.5 leading-relaxed">Enter a code from your physiotherapist to unlock prescribed exercises.</p>
        {exercisesUnlocked ? (
          <div className="flex items-center gap-2.5 bg-success/8 rounded-xl px-3.5 py-2.5">
            <svg className="w-4.5 h-4.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[13px] font-medium text-success">Exercises unlocked</span>
          </div>
        ) : (
          <form onSubmit={handleUnlock} className="flex gap-2">
            <input
              type="text"
              value={unlockCode}
              onChange={(e) => setUnlockCode(e.target.value)}
              placeholder="Enter code"
              className="flex-1 h-11 px-4 rounded-xl bg-white border border-slate-200 text-foreground text-[13px] placeholder:text-slate-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
            <button
              type="submit"
              className="h-11 px-5 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white text-[13px] font-semibold shadow-md shadow-primary/20 transition-all active:scale-95"
            >
              Unlock
            </button>
          </form>
        )}
      </div>

      {/* History */}
      {sessionHistory.length > 0 && (
        <div>
          <h3 className="text-[12px] font-semibold text-foreground uppercase tracking-wider mb-3">Recent Sessions</h3>
          <div className="space-y-2">
            {[...sessionHistory].reverse().slice(0, 5).map((session, i) => (
              <div key={i} className="bg-surface rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/8 flex items-center justify-center">
                    <span className="text-sm">🏋️</span>
                  </div>
                  <div>
                    <span className="text-[13px] font-medium text-foreground capitalize">{session.exercise}</span>
                    <span className="text-[11px] text-muted ml-1.5">{session.totalReps} reps</span>
                  </div>
                </div>
                <span className="text-[11px] text-muted font-medium">
                  {new Date(session.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
