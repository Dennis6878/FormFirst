"use client";

import ExerciseCard from "@/components/ExerciseCard";
import { useAuth } from "@/context/AuthContext";
import { useWorkout } from "@/context/WorkoutContext";
import { Flame, Target, Trophy } from "lucide-react";

const BASE_EXERCISES = [
  {
    title: "Mobility Analysis",
    fullWidth: true,
    image: "/Mobility Analysis.jpeg",
    difficulty: "Full Body",
  },
  {
    title: "Squat",
    href: "/exercises/squat",
    image: "/Squat.jpeg",
    difficulty: "Beginner",
  },
  {
    title: "Push-up",
    image: "/Pushup.jpeg",
    difficulty: "Beginner",
  },
  {
    title: "Lunge",
    image: "/Lunge.jpeg",
    difficulty: "Intermediate",
  },
  {
    title: "Sit-up",
    image: "/Sit-Up.jpeg",
    difficulty: "Beginner",
  },
  {
    title: "Plank",
    image: "/Plank.jpeg",
    difficulty: "Intermediate",
  },
];

const UNLOCKED_EXERCISES = [
  {
    title: "Deadlift",
    image: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&q=80",
    difficulty: "Advanced",
  },
  {
    title: "Hip Thrust",
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80",
    difficulty: "Intermediate",
  },
  {
    title: "Bulgarian Split Squat",
    image: "https://images.unsplash.com/photo-1597347316205-36f6c451fc5c?w=400&q=80",
    difficulty: "Advanced",
  },
];

export default function ExercisesPage() {
  const { exercisesUnlocked, userName } = useAuth();
  const { sessionHistory } = useWorkout();

  const exercises = exercisesUnlocked
    ? [...BASE_EXERCISES, ...UNLOCKED_EXERCISES]
    : BASE_EXERCISES;

  const totalSessions = sessionHistory.length;
  const totalReps = sessionHistory.reduce((sum, s) => sum + s.totalReps, 0);
  const avgScore = sessionHistory.length > 0
    ? Math.round(sessionHistory.reduce((sum, s) => {
        const good = s.repLogs.filter(r => r.errors.length === 0).length;
        return sum + (good / s.totalReps) * 100;
      }, 0) / sessionHistory.length)
    : 0;

  return (
    <div className="flex flex-col h-full pb-4 bg-background">
      <div className="px-5 pt-14 pb-5">
        <p className="text-[13px] text-muted mb-0.5">Welcome back</p>
        <h1 className="text-[24px] font-bold text-foreground tracking-tight">{userName || "User"}</h1>
      </div>

      <div className="px-5 mb-5">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2.5 bg-surface border border-border rounded-lg px-3 py-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
              <Flame className="w-4 h-4 text-brand" />
            </div>
            <div>
              <div className="text-[15px] font-bold text-foreground leading-none">{totalSessions}</div>
              <div className="text-[10px] text-muted mt-0.5">Sessions</div>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2.5 bg-surface border border-border rounded-lg px-3 py-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-brand" />
            </div>
            <div>
              <div className="text-[15px] font-bold text-foreground leading-none">{totalReps}</div>
              <div className="text-[10px] text-muted mt-0.5">Total Reps</div>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2.5 bg-surface border border-border rounded-lg px-3 py-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-brand" />
            </div>
            <div>
              <div className="text-[15px] font-bold text-foreground leading-none">{avgScore}%</div>
              <div className="text-[10px] text-muted mt-0.5">Avg Score</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[14px] font-semibold text-foreground">Exercises</h2>
          <span className="text-[12px] text-muted">{exercises.length} available</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {exercises.map((ex) => (
            <ExerciseCard key={ex.title} {...ex} />
          ))}
        </div>
      </div>
    </div>
  );
}
