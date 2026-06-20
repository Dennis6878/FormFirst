"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useWorkout } from "@/context/WorkoutContext";

export default function ProfilePage() {
  const { userName, email } = useAuth();
  const { sessionHistory } = useWorkout();
  const [unlockCode, setUnlockCode] = useState("");

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlockCode.trim()) {
      toast.success("Code Accepted!", { description: "New exercises have been unlocked." });
      setUnlockCode("");
    }
  };

  const totalSessions = sessionHistory.length;
  const totalReps = sessionHistory.reduce((sum, s) => sum + s.totalReps, 0);

  return (
    <div className="flex flex-col h-full px-5 pt-14 pb-4">
      <h1 className="text-2xl font-bold text-foreground mb-6">Profile</h1>

      <div className="bg-card border border-card-border rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xl font-bold text-primary">
              {(userName || "U")[0].toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">{userName || "User"}</h2>
            <p className="text-xs text-muted">{email || "user@example.com"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-card border border-card-border rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{totalSessions}</div>
          <div className="text-[10px] text-muted uppercase tracking-wider mt-0.5">Sessions</div>
        </div>
        <div className="bg-card border border-card-border rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{totalReps}</div>
          <div className="text-[10px] text-muted uppercase tracking-wider mt-0.5">Total Reps</div>
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-2xl p-5 mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-1">Physio Unlock Code</h3>
        <p className="text-xs text-muted mb-3">Enter a code from your physiotherapist to unlock prescribed exercises.</p>
        <form onSubmit={handleUnlock} className="flex gap-2">
          <input
            type="text"
            value={unlockCode}
            onChange={(e) => setUnlockCode(e.target.value)}
            placeholder="Enter code"
            className="flex-1 h-10 px-3 rounded-xl bg-background border border-card-border text-foreground text-sm placeholder:text-muted/50 focus:outline-none focus:border-primary transition-colors"
          />
          <button
            type="submit"
            className="h-10 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-light transition-colors active:scale-95"
          >
            Unlock
          </button>
        </form>
      </div>

      {sessionHistory.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Recent Sessions</h3>
          <div className="space-y-2">
            {[...sessionHistory].reverse().slice(0, 5).map((session, i) => (
              <div key={i} className="bg-card border border-card-border rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-foreground capitalize">{session.exercise}</span>
                  <span className="text-xs text-muted ml-2">{session.totalReps} reps</span>
                </div>
                <span className="text-[10px] text-muted">
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
