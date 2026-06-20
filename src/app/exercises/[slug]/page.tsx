"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useWorkout } from "@/context/WorkoutContext";

const EXERCISE_DATA: Record<string, { title: string; description: string; videoId: string; icon: string }> = {
  squat: {
    title: "Squat",
    description: `The squat is one of the most fundamental and effective compound exercises you can perform. It primarily targets the quadriceps, hamstrings, and glutes, while also engaging the core, lower back, and calves as stabilizers. Whether you're a beginner or an advanced athlete, the squat should be a staple in your training program.

Proper squat form starts with your feet shoulder-width apart, toes pointed slightly outward (about 15-30 degrees). As you begin the descent, push your hips back as if you're sitting into a chair. Your knees should track over your toes — never let them collapse inward. Keep your chest up and your back straight throughout the entire movement.

One of the most common mistakes is not going deep enough. Aim to lower your hips until your thighs are at least parallel to the ground. Going slightly below parallel (often called "ass to grass") is perfectly fine if your mobility allows it, and it actually engages the glutes more effectively.

Another critical aspect is bracing your core. Before each rep, take a deep breath into your belly, brace your abdominal muscles as if someone is about to punch you in the stomach, and maintain that tension throughout the rep. This creates intra-abdominal pressure that protects your spine.

Weight distribution matters too. Your weight should be evenly distributed across your entire foot — not on your toes, not on your heels. Think about driving through the middle of your foot as you push up from the bottom position.

Common mistakes to watch for include: knees caving inward (valgus), excessive forward lean of the torso, rising on the toes, shifting weight to one side, and cutting depth short. Our AI form analysis checks for these issues in real time and provides instant feedback.

For beginners, start with bodyweight squats to master the movement pattern. Once comfortable, you can progress to goblet squats (holding a weight at your chest), then to barbell back squats. Aim for 3-4 sets of 8-12 reps with controlled tempo — 2-3 seconds on the way down, a brief pause at the bottom, then drive up explosively.`,
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
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-12 pb-2">
          <Link href="/exercises" className="inline-flex items-center gap-1 text-sm text-muted mb-4 hover:text-foreground transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back
          </Link>

          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="text-2xl">{exercise.icon}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{exercise.title}</h1>
              <span className="text-xs font-medium text-muted bg-card-border px-2 py-0.5 rounded-full">Beginner</span>
            </div>
          </div>
        </div>

        {/* Video */}
        <div className="px-5 mb-5">
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

        {/* Description */}
        <div className="px-5 pb-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">How to Perform</h2>
          <div className="text-sm text-muted leading-relaxed whitespace-pre-line">
            {exercise.description}
          </div>
        </div>
      </div>

      {/* Sticky bottom: last session + start button */}
      <div className="flex-shrink-0 border-t border-card-border bg-background px-5 py-4">
        {lastSession && (
          <div className="rounded-xl bg-card border border-card-border p-3 mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Last Session</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-foreground">{lastSession.totalReps} reps</span>
              {lastSession.mostCommonMistake && (
                <span className="text-[10px] text-warning font-medium bg-warning/10 px-2 py-0.5 rounded-full">
                  {lastSession.mostCommonMistake}
                </span>
              )}
            </div>
          </div>
        )}
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
