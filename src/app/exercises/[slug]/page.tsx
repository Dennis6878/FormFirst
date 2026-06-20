"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useWorkout } from "@/context/WorkoutContext";
import { ChevronLeft, Play, Clock, Zap, Target, Shield, Lightbulb, TrendingUp } from "lucide-react";

const EXERCISE_DATA: Record<string, {
  title: string;
  description: string;
  videoId: string;
  icon: string;
  muscles: string[];
  tips: { icon: typeof Shield; title: string; text: string }[];
}> = {
  squat: {
    title: "Squat",
    description: `The squat is one of the most fundamental and effective compound exercises you can perform. It primarily targets the quadriceps, hamstrings, and glutes, while also engaging the core, lower back, and calves as stabilizers.

Proper squat form starts with your feet shoulder-width apart, toes pointed slightly outward (about 15-30 degrees). As you begin the descent, push your hips back as if you're sitting into a chair. Your knees should track over your toes — never let them collapse inward.

One of the most common mistakes is not going deep enough. Aim to lower your hips until your thighs are at least parallel to the ground. Going slightly below parallel is perfectly fine if your mobility allows it, and it actually engages the glutes more effectively.

Another critical aspect is bracing your core. Before each rep, take a deep breath into your belly, brace your abdominal muscles, and maintain that tension throughout the rep. This creates intra-abdominal pressure that protects your spine.

Weight distribution matters too. Your weight should be evenly distributed across your entire foot — not on your toes, not on your heels. Think about driving through the middle of your foot as you push up.

Common mistakes include: knees caving inward, excessive forward lean, rising on the toes, shifting weight to one side, and cutting depth short. Our AI form analysis checks for these issues in real time.

For beginners, start with bodyweight squats to master the movement pattern. Once comfortable, progress to goblet squats, then barbell back squats. Aim for 3-4 sets of 8-12 reps with controlled tempo.`,
    videoId: "YaXPRqUwItQ",
    icon: "🏋️",
    muscles: ["Quadriceps", "Glutes", "Hamstrings", "Core"],
    tips: [
      { icon: Shield, title: "Knee Safety", text: "Keep knees tracking over toes, never caving inward" },
      { icon: Lightbulb, title: "Core Bracing", text: "Deep breath in, brace abs before each rep" },
      { icon: TrendingUp, title: "Depth Goal", text: "Hips to at least parallel with the ground" },
    ],
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
        <Link href="/exercises" className="mt-4 text-foreground text-sm font-medium">
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
    <div className="flex flex-col h-full bg-background">
      {/* Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* Back button */}
        <div className="px-5 pt-14 pb-3">
          <Link href="/exercises" className="inline-flex items-center gap-1 text-[13px] text-muted hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        {/* Title */}
        <div className="px-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{exercise.icon}</span>
            <div>
              <h1 className="text-[22px] font-bold text-foreground tracking-tight">{exercise.title}</h1>
              <span className="text-[12px] text-muted">Beginner · Compound</span>
            </div>
          </div>

          {/* Info chips */}
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 bg-surface border border-border rounded-lg px-2.5 py-1.5">
              <Clock className="w-3.5 h-3.5 text-muted" />
              <span className="text-[11px] font-medium text-foreground">5-15 min</span>
            </div>
            <div className="flex items-center gap-1.5 bg-surface border border-border rounded-lg px-2.5 py-1.5">
              <Zap className="w-3.5 h-3.5 text-muted" />
              <span className="text-[11px] font-medium text-foreground">8-12 reps</span>
            </div>
            <div className="flex items-center gap-1.5 bg-surface border border-border rounded-lg px-2.5 py-1.5">
              <Target className="w-3.5 h-3.5 text-muted" />
              <span className="text-[11px] font-medium text-foreground">3-4 sets</span>
            </div>
          </div>
        </div>

        {/* Video */}
        <div className="px-5 mb-5">
          <div className="rounded-xl overflow-hidden border border-border aspect-video bg-zinc-100">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${exercise.videoId}`}
              title={`${exercise.title} tutorial`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        {/* Muscles */}
        <div className="px-5 mb-5">
          <h2 className="text-[12px] font-semibold text-muted uppercase tracking-wider mb-2.5">Target Muscles</h2>
          <div className="flex flex-wrap gap-1.5">
            {exercise.muscles.map((m) => (
              <span key={m} className="text-[12px] font-medium text-foreground bg-surface border border-border rounded-md px-2.5 py-1">
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Quick tips */}
        <div className="px-5 mb-5">
          <h2 className="text-[12px] font-semibold text-muted uppercase tracking-wider mb-2.5">Key Tips</h2>
          <div className="space-y-2">
            {exercise.tips.map((tip) => (
              <div key={tip.title} className="flex gap-3 bg-surface border border-border rounded-xl p-3">
                <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center flex-shrink-0">
                  <tip.icon className="w-4 h-4 text-muted" />
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-foreground">{tip.title}</div>
                  <div className="text-[12px] text-muted leading-relaxed">{tip.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Full description */}
        <div className="px-5 pb-8">
          <h2 className="text-[12px] font-semibold text-muted uppercase tracking-wider mb-2.5">Full Guide</h2>
          <div className="text-[13px] text-muted leading-[1.7] whitespace-pre-line">
            {exercise.description}
          </div>
        </div>
      </div>

      {/* Sticky bottom */}
      <div className="flex-shrink-0 border-t border-border bg-background px-5 py-3.5">
        {lastSession && (
          <div className="rounded-lg bg-surface border border-border p-2.5 mb-2.5 flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted">Last: {lastSession.totalReps} reps</span>
            {lastSession.mostCommonMistake && (
              <span className="text-[10px] font-medium text-warning bg-orange-50 px-2 py-0.5 rounded-md">
                {lastSession.mostCommonMistake}
              </span>
            )}
          </div>
        )}
        <button
          onClick={handleStart}
          className="w-full h-11 rounded-lg bg-foreground text-white font-medium text-[14px] hover:bg-foreground/90 transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" fill="currentColor" />
          Start Analysis
        </button>
      </div>
    </div>
  );
}
