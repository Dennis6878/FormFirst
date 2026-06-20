"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const NAV_ITEMS = [
  {
    href: "/exercises",
    label: "Exercises",
    icon: (active: boolean) => (
      <svg className="w-[22px] h-[22px]" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (active: boolean) => (
      <svg className="w-[22px] h-[22px]" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
];

const HIDE_NAV_ROUTES = ["/", "/analysis", "/summary"];

export default function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNav = !HIDE_NAV_ROUTES.includes(pathname);

  return (
    <div className="flex items-center justify-center w-full h-dvh bg-gradient-to-b from-slate-200 to-slate-300">
      <div className="relative w-[390px] h-[844px] max-h-dvh bg-background rounded-[2.5rem] overflow-hidden shadow-[0_25px_60px_-12px_rgba(0,0,0,0.15)] ring-1 ring-black/[0.04] flex flex-col">
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
        {showNav && (
          <nav className="flex-shrink-0 bg-white/80 backdrop-blur-xl border-t border-slate-100">
            <div className="flex items-center justify-around h-[72px] px-8">
              {NAV_ITEMS.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center gap-1 py-2 px-5 rounded-2xl transition-all duration-200 ${
                      active
                        ? "text-primary"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {item.icon(active)}
                    <span className={`text-[10px] tracking-wide ${active ? "font-semibold" : "font-medium"}`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
