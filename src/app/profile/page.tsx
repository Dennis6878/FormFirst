"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useWorkout } from "@/context/WorkoutContext";
import { Lock, Unlock, ChevronRight, Award, Calendar, Repeat, Settings, HelpCircle, LogOut, Dumbbell } from "lucide-react";

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
    <div className="flex flex-col h-full pb-4 bg-background">
      {/* Header */}
      <div className="px-5 pt-14 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-full bg-foreground flex items-center justify-center">
            <span className="text-[20px] font-bold text-white">
              {(userName || "U")[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-[18px] font-bold text-foreground">{userName || "User"}</h1>
            <p className="text-[13px] text-muted">{email || "user@example.com"}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 mb-5">
        <div className="flex gap-2">
          <div className="flex-1 bg-surface border border-border rounded-xl p-3.5 text-center">
            <div className="flex items-center justify-center mb-1.5">
              <Calendar className="w-4 h-4 text-muted" />
            </div>
            <div className="text-[20px] font-bold text-foreground leading-none">{totalSessions}</div>
            <div className="text-[10px] text-muted mt-1 font-medium">Sessions</div>
          </div>
          <div className="flex-1 bg-surface border border-border rounded-xl p-3.5 text-center">
            <div className="flex items-center justify-center mb-1.5">
              <Repeat className="w-4 h-4 text-muted" />
            </div>
            <div className="text-[20px] font-bold text-foreground leading-none">{totalReps}</div>
            <div className="text-[10px] text-muted mt-1 font-medium">Total Reps</div>
          </div>
          <div className="flex-1 bg-surface border border-border rounded-xl p-3.5 text-center">
            <div className="flex items-center justify-center mb-1.5">
              <Award className="w-4 h-4 text-muted" />
            </div>
            <div className="text-[20px] font-bold text-foreground leading-none">{sessionHistory.length > 0 ? sessionHistory.length : "—"}</div>
            <div className="text-[10px] text-muted mt-1 font-medium">Streak</div>
          </div>
        </div>
      </div>

      {/* Physio unlock */}
      <div className="px-5 mb-5">
        <h2 className="text-[12px] font-semibold text-muted uppercase tracking-wider mb-2.5">Physio Code</h2>
        <div className="bg-surface border border-border rounded-xl p-4">
          {exercisesUnlocked ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Unlock className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-foreground">Exercises Unlocked</div>
                <div className="text-[11px] text-muted">3 additional exercises available</div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center">
                  <Lock className="w-4 h-4 text-muted" />
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-foreground">Unlock Exercises</div>
                  <div className="text-[11px] text-muted">Enter code from your physiotherapist</div>
                </div>
              </div>
              <form onSubmit={handleUnlock} className="flex gap-2">
                <input
                  type="text"
                  value={unlockCode}
                  onChange={(e) => setUnlockCode(e.target.value)}
                  placeholder="Enter code"
                  className="flex-1 h-9 px-3 rounded-lg border border-border bg-background text-foreground text-[13px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/5 focus:border-foreground/20 transition-all"
                />
                <button
                  type="submit"
                  className="h-9 px-4 rounded-lg bg-brand text-white text-[12px] font-medium hover:bg-brand-light transition-colors active:scale-95"
                >
                  Unlock
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Recent sessions */}
      {sessionHistory.length > 0 && (
        <div className="px-5 mb-5">
          <h2 className="text-[12px] font-semibold text-muted uppercase tracking-wider mb-2.5">Recent Sessions</h2>
          <div className="bg-surface border border-border rounded-xl overflow-hidden divide-y divide-border">
            {[...sessionHistory].reverse().slice(0, 4).map((session, i) => {
              const good = session.repLogs.filter(r => r.errors.length === 0).length;
              const pct = Math.round((good / session.totalReps) * 100);
              return (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center"><Dumbbell className="w-4 h-4 text-brand" /></div>
                    <div>
                      <div className="text-[13px] font-medium text-foreground capitalize">{session.exercise}</div>
                      <div className="text-[11px] text-muted">{session.totalReps} reps · {pct}% good form</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-muted">
                    {new Date(session.date).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Settings menu */}
      <div className="px-5 mt-auto">
        <div className="bg-surface border border-border rounded-xl overflow-hidden divide-y divide-border">
          {[
            { icon: Settings, label: "Settings" },
            { icon: HelpCircle, label: "Help & Support" },
            { icon: LogOut, label: "Log Out" },
          ].map(({ icon: Icon, label }) => (
            <button key={label} className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-muted" />
                <span className="text-[13px] font-medium text-foreground">{label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
