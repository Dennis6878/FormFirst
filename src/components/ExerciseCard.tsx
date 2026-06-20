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
  const height = fullWidth ? "h-[140px]" : "h-[160px]";

  const card = (
    <div
      className={`relative rounded-[20px] overflow-hidden transition-all duration-200 active:scale-[0.97] ${
        fullWidth ? "col-span-2" : ""
      } ${height} cursor-pointer group shadow-sm shadow-black/[0.04]`}
    >
      {image && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-110"
          style={{ backgroundImage: `url(${image})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

      <div className="relative h-full flex flex-col justify-end p-4">
        <span className="text-[22px] mb-0.5 drop-shadow-md">{icon}</span>
        <h3 className="font-semibold text-white text-[15px] tracking-tight drop-shadow-md">{title}</h3>
        {difficulty && (
          <span className="inline-block mt-1.5 text-[10px] font-medium px-2.5 py-[3px] rounded-full bg-white/15 text-white/90 backdrop-blur-md w-fit tracking-wide">
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
