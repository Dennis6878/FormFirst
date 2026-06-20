"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Dumbbell, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/exercises", label: "Exercises", Icon: Dumbbell },
  { href: "/profile", label: "Profile", Icon: User },
];

const HIDE_NAV_ROUTES = ["/", "/analysis", "/summary"];

export default function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNav = !HIDE_NAV_ROUTES.includes(pathname);

  return (
    <div className="flex items-center justify-center w-full h-dvh bg-zinc-400/50">
      <div className="relative w-[390px] h-[844px] max-h-dvh bg-background rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-black/5 flex flex-col">
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
        {showNav && (
          <nav className="flex-shrink-0 border-t border-border bg-background">
            <div className="flex items-center justify-around h-[68px] px-6">
              {NAV_ITEMS.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center gap-1 py-2 px-6 transition-colors ${
                      active ? "text-brand" : "text-muted-foreground hover:text-muted"
                    }`}
                  >
                    <item.Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.5} />
                    <span className={`text-[10px] ${active ? "font-semibold" : "font-medium"}`}>
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
