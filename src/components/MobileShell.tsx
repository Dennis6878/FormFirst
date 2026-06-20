"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/exercises", label: "Exercises", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { href: "/profile", label: "Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { href: "/dashboard", label: "Physio", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
];

const HIDE_NAV_ROUTES = ["/", "/analysis", "/summary"];

export default function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNav = !HIDE_NAV_ROUTES.includes(pathname);

  return (
    <div className="flex items-center justify-center w-full h-dvh bg-black">
      <div className="relative w-[390px] h-[844px] max-h-dvh bg-background rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 border border-card-border flex flex-col">
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
        {showNav && (
          <nav className="flex-shrink-0 flex items-center justify-around h-16 bg-card border-t border-card-border px-4">
            {NAV_ITEMS.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-colors ${
                    active ? "text-primary" : "text-muted hover:text-foreground"
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
