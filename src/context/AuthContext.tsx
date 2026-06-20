"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface AuthState {
  isLoggedIn: boolean;
  userName: string;
  email: string;
  exercisesUnlocked: boolean;
  login: (name: string, email: string) => void;
  logout: () => void;
  unlockExercises: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [exercisesUnlocked, setExercisesUnlocked] = useState(false);

  const login = useCallback((name: string, email: string) => {
    setUser({ name, email });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const unlockExercises = useCallback(() => {
    setExercisesUnlocked(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!user,
        userName: user?.name ?? "",
        email: user?.email ?? "",
        exercisesUnlocked,
        login,
        logout,
        unlockExercises,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
