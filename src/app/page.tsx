"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

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
    <div className="flex flex-col h-full px-7 bg-background">
      <div className="flex-1 flex flex-col justify-center">
        {/* Hero */}
        <div className="mb-10">
          <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mb-8 shadow-lg shadow-primary/20">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-[28px] font-bold text-foreground tracking-tight leading-tight mb-2">
            Welcome to<br />FormCheck
          </h1>
          <p className="text-[15px] text-muted leading-relaxed">
            AI-powered exercise form analysis.<br />Real-time feedback on your technique.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="block text-[13px] font-medium text-slate-500 mb-1.5 ml-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full h-[52px] px-4 rounded-2xl bg-surface border border-slate-200 text-foreground placeholder:text-slate-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-[15px]"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-slate-500 mb-1.5 ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full h-[52px] px-4 rounded-2xl bg-surface border border-slate-200 text-foreground placeholder:text-slate-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-[15px]"
            />
          </div>
          <button
            type="submit"
            className="w-full h-[52px] mt-1 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white font-semibold text-[15px] shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98]"
          >
            Get Started
          </button>
        </form>

        {/* Divider */}
        <div className="mt-7 flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-[12px] text-slate-300 font-medium">or</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        {/* Google */}
        <button
          onClick={handleSubmit}
          className="mt-4 w-full h-[52px] rounded-2xl border border-slate-200 text-foreground font-medium text-[14px] hover:bg-surface transition-all flex items-center justify-center gap-2.5 active:scale-[0.98]"
        >
          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}
