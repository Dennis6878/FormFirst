"use client";

import Link from "next/link";

interface ExerciseCardProps {
  title: string;
  icon: string;
  href?: string;
  fullWidth?: boolean;
  difficulty?: string;
  image?: string;
}

export default function ExerciseCard({
  title,
  icon,
  href,
  fullWidth,
  difficulty,
  image,
}: ExerciseCardProps) {
  const height = fullWidth ? "h-36" : "h-40";

  const card = (
    <div
      className={`relative rounded-2xl overflow-hidden transition-all active:scale-[0.97] ${
        fullWidth ? "col-span-2" : ""
      } ${height} cursor-pointer group`}
    >
      {image && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundImage: `url(${image})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

      <div className="relative h-full flex flex-col justify-end p-4">
        <span className="text-2xl mb-1 drop-shadow-lg">{icon}</span>
        <h3 className="font-bold text-white text-base drop-shadow-lg">{title}</h3>
        {difficulty && (
          <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white/80 backdrop-blur-sm w-fit">
            {difficulty}
          </span>
        )}
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
