"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ExerciseCardProps {
  title: string;
  href?: string;
  fullWidth?: boolean;
  difficulty?: string;
  image?: string;
}

export default function ExerciseCard({
  title,
  href,
  fullWidth,
  difficulty,
  image,
}: ExerciseCardProps) {
  const height = fullWidth ? "h-[130px]" : "h-[150px]";

  const card = (
    <div
      className={`relative rounded-xl overflow-hidden transition-all duration-200 active:scale-[0.97] ${
        fullWidth ? "col-span-2" : ""
      } ${height} cursor-pointer group`}
    >
      {image && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-105"
          style={{ backgroundImage: `url(${image})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5" />

      <div className="relative h-full flex flex-col justify-between p-3.5">
        <div className="flex items-start justify-between">
          {difficulty && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-black/30 text-white/80 backdrop-blur-sm">
              {difficulty}
            </span>
          )}
          {href && (
            <div className="w-6 h-6 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        <h3 className="font-semibold text-white text-[14px] leading-tight">{title}</h3>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={fullWidth ? "col-span-2" : ""}>
        {card}
      </Link>
    );
  }

  return <div className={fullWidth ? "col-span-2" : ""}>{card}</div>;
}
