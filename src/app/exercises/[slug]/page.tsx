"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useWorkout } from "@/context/WorkoutContext";

const EXERCISE_DATA: Record<string, { title: string; description: string; videoId: string; icon: string }> = {
  squat: {
    title: "Squat",
    description: "The squat is a fundamental compound movement that targets your quadriceps, hamstrings, glutes, and core. Proper form is essential to prevent knee and back injuries.",
    videoId: "YaXPRqUwItQ",
    icon: "🏋️",
  },
};

export default function ExerciseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { getLastSession, startSession } = useWorkout();

  const exercise = EXERCISE_DATA[slug];
  if (!exercise) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8">
        <p className="text-muted text-center">Exercise not found</p>
        <Link href="/exercises" className="mt-4 text-primary text-sm font-medium">
          Back to exercises
        </Link>
      </div>
    );
  }

  const lastSession = getLastSession(slug);

  const handleStart = () => {
    startSession(slug);
    router.push(`/analysis?exercise=${slug}`);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-14 pb-4">
        <Link href="/exercises" className="inline-flex items-center gap-1 text-sm text-muted mb-4 hover:text-foreground transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </Link>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center">
            <span className="text-3xl">{exercise.icon}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{exercise.title}</h1>
            <span className="text-xs font-medium text-muted bg-card-border px-2 py-0.5 rounded-full">Beginner</span>
          </div>
        </div>

        <p className="text-sm text-muted leading-relaxed mb-6">{exercise.description}</p>
      </div>

      <div className="px-5 mb-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Tutorial Video</h2>
        <div className="rounded-2xl overflow-hidden border border-card-border aspect-video">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${exercise.videoId}`}
            title={`${exercise.title} tutorial`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      {lastSession && (
        <div className="px-5 mb-4">
          <div className="rounded-2xl bg-card border border-card-border p-4">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Last Session</h3>
            <div className="flex items-center gap-4">
              <div>
                <span className="text-2xl font-bold text-foreground">{lastSession.totalReps}</span>
                <span className="text-xs text-muted ml-1">reps</span>
              </div>
              {lastSession.mostCommonMistake && (
                <div className="flex-1 text-right">
                  <span className="text-xs text-warning">Most common: {lastSession.mostCommonMistake}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-auto px-5 pb-6">
        <button
          onClick={handleStart}
          className="w-full h-14 rounded-2xl bg-primary text-white font-semibold text-base hover:bg-primary-light transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
          </svg>
          Start Analysis
        </button>
      </div>
    </div>
  );
}
