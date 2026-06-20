"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { RepLog, SessionSummary, CalibrationData } from "@/lib/squat/types";

interface WorkoutState {
  repLogs: RepLog[];
  calibrationData: CalibrationData | null;
  sessionHistory: SessionSummary[];
  currentExercise: string | null;
  recordedVideoUrl: string | null;
  addRep: (log: RepLog) => void;
  setCalibration: (data: CalibrationData) => void;
  startSession: (exercise: string) => void;
  endSession: () => SessionSummary | null;
  clearCurrentSession: () => void;
  getLastSession: (exercise: string) => SessionSummary | undefined;
  setRecordedVideo: (url: string | null) => void;
}

const WorkoutContext = createContext<WorkoutState | null>(null);

function getMostCommonMistake(logs: RepLog[]): string | null {
  const counts: Record<string, number> = {};
  for (const log of logs) {
    for (const err of log.errors) {
      counts[err] = (counts[err] || 0) + 1;
    }
  }
  let max = 0;
  let result: string | null = null;
  for (const [err, count] of Object.entries(counts)) {
    if (count > max) {
      max = count;
      result = err;
    }
  }
  return result;
}

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [repLogs, setRepLogs] = useState<RepLog[]>([]);
  const [calibrationData, setCalibrationData] = useState<CalibrationData | null>(null);
  const [currentExercise, setCurrentExercise] = useState<string | null>(null);
  const [sessionHistory, setSessionHistory] = useState<SessionSummary[]>([]);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("formcheck_history");
      if (stored) setSessionHistory(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    if (sessionHistory.length > 0) {
      sessionStorage.setItem("formcheck_history", JSON.stringify(sessionHistory));
    }
  }, [sessionHistory]);

  const addRep = useCallback((log: RepLog) => {
    setRepLogs((prev) => [...prev, log]);
  }, []);

  const setCalibration = useCallback((data: CalibrationData) => {
    setCalibrationData(data);
  }, []);

  const startSession = useCallback((exercise: string) => {
    setCurrentExercise(exercise);
    setRepLogs([]);
    setCalibrationData(null);
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
    }
    setRecordedVideoUrl(null);
  }, [recordedVideoUrl]);

  const endSession = useCallback((): SessionSummary | null => {
    if (!currentExercise || repLogs.length === 0) return null;
    const summary: SessionSummary = {
      exercise: currentExercise,
      totalReps: repLogs.length,
      repLogs: [...repLogs],
      mostCommonMistake: getMostCommonMistake(repLogs),
      date: Date.now(),
    };
    setSessionHistory((prev) => [...prev, summary]);
    return summary;
  }, [currentExercise, repLogs]);

  const clearCurrentSession = useCallback(() => {
    setRepLogs([]);
    setCalibrationData(null);
    setCurrentExercise(null);
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
    }
    setRecordedVideoUrl(null);
  }, [recordedVideoUrl]);

  const getLastSession = useCallback(
    (exercise: string) => {
      return [...sessionHistory].reverse().find((s) => s.exercise === exercise);
    },
    [sessionHistory]
  );

  const setRecordedVideo = useCallback((url: string | null) => {
    setRecordedVideoUrl(url);
  }, []);

  return (
    <WorkoutContext.Provider
      value={{
        repLogs,
        calibrationData,
        sessionHistory,
        currentExercise,
        recordedVideoUrl,
        addRep,
        setCalibration,
        startSession,
        endSession,
        clearCurrentSession,
        getLastSession,
        setRecordedVideo,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error("useWorkout must be used within WorkoutProvider");
  return ctx;
}
