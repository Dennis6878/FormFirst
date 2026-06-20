"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Camera, BarChart3, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(name || "User", email || "user@example.com");
    router.push("/exercises");
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="bg-foreground text-white px-7 pt-16 pb-8 rounded-b-[2rem]">
        <div className="flex items-center gap-3 mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="FormFirst" className="w-11 h-11 object-contain" />
          <span className="text-[18px] font-bold tracking-tight">FormFirst</span>
        </div>
        <h1 className="text-[26px] font-bold tracking-tight leading-[1.2] mb-2">
          Don&apos;t train<br />like a shrimp
        </h1>
        <p className="text-zinc-400 text-[14px] leading-relaxed">
          Real-time AI form analysis and instant feedback for every rep.
        </p>

        <div className="flex gap-2 mt-5">
          {[
            { icon: Camera, label: "Live Analysis" },
            { icon: BarChart3, label: "Rep Tracking" },
            { icon: Sparkles, label: "AI Coaching" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
              <Icon className="w-3 h-3 text-brand" />
              <span className="text-[11px] font-medium text-zinc-300">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 px-7 pt-7 pb-6 flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-[13px] font-medium text-foreground mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full h-11 px-3.5 rounded-lg border border-border bg-background text-foreground text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-foreground mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full h-11 px-3.5 rounded-lg border border-border bg-background text-foreground text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/10 focus:border-brand/30 transition-all"
            />
          </div>
          <button
            type="submit"
            className="w-full h-11 mt-1 rounded-lg bg-brand text-white font-medium text-[14px] hover:bg-brand-light transition-colors active:scale-[0.98]"
          >
            Get Started
          </button>
        </form>

        <div className="mt-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[12px] text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <button
          onClick={handleSubmit}
          className="mt-4 w-full h-11 rounded-lg border border-border text-foreground font-medium text-[13px] hover:bg-surface transition-colors flex items-center justify-center gap-2.5 active:scale-[0.98]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-[11px] text-muted-foreground mt-auto pt-4">
          By continuing you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
