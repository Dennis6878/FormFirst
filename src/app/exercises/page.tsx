"use client";

import ExerciseCard from "@/components/ExerciseCard";
import { useAuth } from "@/context/AuthContext";

const BASE_EXERCISES = [
  {
    title: "Mobility Analysis",
    icon: "🧘",
    fullWidth: true,
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
    difficulty: "Full Body",
  },
  {
    title: "Squat",
    icon: "🏋️",
    href: "/exercises/squat",
    image: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400&q=80",
    difficulty: "Beginner",
  },
  {
    title: "Push-up",
    icon: "💪",
    image: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&q=80",
    difficulty: "Beginner",
  },
  {
    title: "Lunge",
    icon: "🦵",
    image: "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=400&q=80",
    difficulty: "Intermediate",
  },
  {
    title: "Sit-up",
    icon: "🤸",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80",
    difficulty: "Beginner",
  },
  {
    title: "Plank",
    icon: "🧱",
    image: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400&q=80",
    difficulty: "Intermediate",
  },
];

const UNLOCKED_EXERCISES = [
  {
    title: "Deadlift",
    icon: "🏗️",
    image: "https://images.unsplash.com/photo-1534368786749-b63e05c92717?w=400&q=80",
    difficulty: "Advanced",
  },
  {
    title: "Hip Thrust",
    icon: "🍑",
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80",
    difficulty: "Intermediate",
  },
  {
    title: "Bulgarian Split Squat",
    icon: "🦿",
    image: "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=400&q=80",
    difficulty: "Advanced",
  },
];

export default function ExercisesPage() {
  const { exercisesUnlocked } = useAuth();

  const exercises = exercisesUnlocked
    ? [...BASE_EXERCISES, ...UNLOCKED_EXERCISES]
    : BASE_EXERCISES;

  return (
    <div className="flex flex-col h-full px-5 pt-16 pb-4">
      <div className="mb-7">
        <h1 className="text-[26px] font-bold text-foreground tracking-tight">Exercises</h1>
        <p className="text-[14px] text-muted mt-1">Choose an exercise to analyze your form</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {exercises.map((ex) => (
          <ExerciseCard key={ex.title} {...ex} />
        ))}
      </div>
    </div>
  );
}
