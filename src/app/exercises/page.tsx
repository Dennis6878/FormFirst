"use client";

import ExerciseCard from "@/components/ExerciseCard";

const EXERCISES = [
  {
    title: "Mobility Analysis",
    icon: "🧘",
    comingSoon: true,
    fullWidth: true,
    accentColor: "bg-accent/15 text-accent",
    difficulty: "Full Body",
  },
  {
    title: "Squat",
    icon: "🏋️",
    href: "/exercises/squat",
    difficulty: "Beginner",
  },
  {
    title: "Push-up",
    icon: "💪",
    difficulty: "Beginner",
  },
  {
    title: "Lunge",
    icon: "🦵",
    locked: true,
    difficulty: "Intermediate",
  },
  {
    title: "Sit-up",
    icon: "🤸",
    difficulty: "Beginner",
  },
  {
    title: "Plank",
    icon: "🧱",
    locked: true,
    difficulty: "Intermediate",
  },
];

export default function ExercisesPage() {
  return (
    <div className="flex flex-col h-full px-5 pt-14 pb-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Exercises</h1>
        <p className="text-sm text-muted mt-1">Choose an exercise to analyze your form</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {EXERCISES.map((ex) => (
          <ExerciseCard key={ex.title} {...ex} />
        ))}
      </div>
    </div>
  );
}
