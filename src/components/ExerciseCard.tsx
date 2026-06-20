"use client";

import Link from "next/link";
import { toast } from "sonner";

interface ExerciseCardProps {
  title: string;
  icon: string;
  href?: string;
  locked?: boolean;
  comingSoon?: boolean;
  fullWidth?: boolean;
  accentColor?: string;
  difficulty?: string;
}

export default function ExerciseCard({
  title,
  icon,
  href,
  locked,
  comingSoon,
  fullWidth,
  accentColor = "bg-primary/15 text-primary",
  difficulty,
}: ExerciseCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (comingSoon) {
      e.preventDefault();
      toast("Coming soon!", { description: `${title} will be available in a future update.` });
    } else if (locked) {
      e.preventDefault();
      toast("Exercise Locked", { description: "Ask your physiotherapist for an unlock code." });
    }
  };

  const card = (
    <div
      onClick={!href ? handleClick : undefined}
      className={`relative rounded-2xl border border-card-border bg-card p-4 transition-all active:scale-[0.97] ${
        fullWidth ? "col-span-2" : ""
      } ${locked ? "opacity-60" : "hover:border-primary/30"} ${
        comingSoon ? "border-accent/20 bg-accent/5" : ""
      } cursor-pointer`}
    >
      <div className={`w-12 h-12 rounded-xl ${accentColor} flex items-center justify-center mb-3`}>
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="font-semibold text-foreground text-sm">{title}</h3>
      {difficulty && (
        <span className="inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-card-border text-muted">
          {difficulty}
        </span>
      )}
      {comingSoon && (
        <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/20 text-accent">
          Coming Soon
        </span>
      )}
      {locked && (
        <div className="absolute top-3 right-3">
          <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
      )}
    </div>
  );

  if (href && !locked && !comingSoon) {
    return (
      <Link href={href} className={fullWidth ? "col-span-2" : ""}>
        {card}
      </Link>
    );
  }

  return <div className={fullWidth ? "col-span-2" : ""}>{card}</div>;
}
