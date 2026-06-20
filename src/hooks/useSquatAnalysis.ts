"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type { PoseLandmarkerResult } from "@mediapipe/tasks-vision";
import { AnalysisStage, type CalibrationData, type RepLog } from "@/lib/squat/types";
import { LANDMARKS, CALIBRATION_FRAMES, CALIBRATION_STABILITY_THRESHOLD, CONSECUTIVE_ERROR_REPS_FOR_STOP } from "@/lib/squat/constants";
import { createInitialState, transition, type StateMachineState } from "@/lib/squat/stateMachine";
import { runAllChecks } from "@/lib/squat/formChecks";
import { useWorkout } from "@/context/WorkoutContext";

interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export function useSquatAnalysis(poseResult: PoseLandmarkerResult | null) {
  const { addRep, setCalibration: setCtxCalibration } = useWorkout();

  const [stage, setStage] = useState<AnalysisStage>(AnalysisStage.WAITING);
  const [calibration, setCalibration] = useState<CalibrationData | null>(null);
  const [repCount, setRepCount] = useState(0);
  const [feedbackMessages, setFeedbackMessages] = useState<string[]>([]);
  const [shouldStop, setShouldStop] = useState(false);
  const [phase, setPhase] = useState("STANDING");

  const fsmRef = useRef<StateMachineState>(createInitialState());
  const calibFramesRef = useRef<Landmark[][]>([]);
  const consecutiveCriticalRef = useRef(0);
  const currentRepErrorsRef = useRef<string[]>([]);

  const calibrate = useCallback((landmarks: Landmark[]) => {
    calibFramesRef.current.push(landmarks);

    if (calibFramesRef.current.length < CALIBRATION_FRAMES) return;

    const frames = calibFramesRef.current;
    const hipYs = frames.map((f) => (f[LANDMARKS.LEFT_HIP].y + f[LANDMARKS.RIGHT_HIP].y) / 2);
    const range = Math.max(...hipYs) - Math.min(...hipYs);

    if (range > CALIBRATION_STABILITY_THRESHOLD) {
      calibFramesRef.current = calibFramesRef.current.slice(-10);
      return;
    }

    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

    const avgLandmarks = Array.from({ length: 33 }, (_, i) => ({
      x: avg(frames.map((f) => f[i].x)),
      y: avg(frames.map((f) => f[i].y)),
      z: avg(frames.map((f) => f[i].z)),
    }));

    const hipMidY = (avgLandmarks[LANDMARKS.LEFT_HIP].y + avgLandmarks[LANDMARKS.RIGHT_HIP].y) / 2;
    const kneeMidY = (avgLandmarks[LANDMARKS.LEFT_KNEE].y + avgLandmarks[LANDMARKS.RIGHT_KNEE].y) / 2;

    const data: CalibrationData = {
      standingHipY: hipMidY,
      standingKneeY: kneeMidY,
      standingHipKneeDelta: kneeMidY - hipMidY,
      standingKneeDistance: Math.abs(avgLandmarks[LANDMARKS.LEFT_KNEE].x - avgLandmarks[LANDMARKS.RIGHT_KNEE].x),
      standingAnkleDistance: Math.abs(avgLandmarks[LANDMARKS.LEFT_ANKLE].x - avgLandmarks[LANDMARKS.RIGHT_ANKLE].x),
      standingShoulderMidX: (avgLandmarks[LANDMARKS.LEFT_SHOULDER].x + avgLandmarks[LANDMARKS.RIGHT_SHOULDER].x) / 2,
      standingHipMidX: (avgLandmarks[LANDMARKS.LEFT_HIP].x + avgLandmarks[LANDMARKS.RIGHT_HIP].x) / 2,
    };

    setCalibration(data);
    setCtxCalibration(data);
    setStage(AnalysisStage.ACTIVE);
  }, [setCtxCalibration]);

  useEffect(() => {
    if (!poseResult || !poseResult.landmarks || poseResult.landmarks.length === 0) return;

    const landmarks = poseResult.landmarks[0] as Landmark[];
    if (landmarks.length < 33) return;

    if (stage === AnalysisStage.WAITING) {
      setStage(AnalysisStage.CALIBRATING);
      calibFramesRef.current = [];
      return;
    }

    if (stage === AnalysisStage.CALIBRATING) {
      calibrate(landmarks);
      return;
    }

    if (stage !== AnalysisStage.ACTIVE || !calibration) return;

    const { results, errors, hasCriticalError } = runAllChecks(landmarks, calibration);
    void results;

    if (errors.length > 0) {
      for (const err of errors) {
        if (!currentRepErrorsRef.current.includes(err)) {
          currentRepErrorsRef.current.push(err);
        }
      }
    }

    setFeedbackMessages(errors);

    const { newState, repCompleted } = transition(fsmRef.current, landmarks, calibration);
    fsmRef.current = newState;
    setPhase(newState.phase);

    if (repCompleted) {
      const repLog: RepLog = {
        repNumber: newState.repCount,
        errors: [...currentRepErrorsRef.current],
        timestamp: Date.now(),
      };
      addRep(repLog);
      setRepCount(newState.repCount);

      if (currentRepErrorsRef.current.some((e) => e === "Knees caving in" || e === "Shift weight to center")) {
        consecutiveCriticalRef.current += 1;
      } else {
        consecutiveCriticalRef.current = 0;
      }

      if (consecutiveCriticalRef.current >= CONSECUTIVE_ERROR_REPS_FOR_STOP) {
        setShouldStop(true);
      }

      currentRepErrorsRef.current = [];
    }

    if (hasCriticalError) {
      // errors are already tracked per-rep via currentRepErrorsRef
    }
  }, [poseResult, stage, calibration, calibrate, addRep]);

  const reset = useCallback(() => {
    fsmRef.current = createInitialState();
    calibFramesRef.current = [];
    consecutiveCriticalRef.current = 0;
    currentRepErrorsRef.current = [];
    setStage(AnalysisStage.WAITING);
    setCalibration(null);
    setRepCount(0);
    setFeedbackMessages([]);
    setShouldStop(false);
  }, []);

  return {
    stage,
    repCount,
    feedbackMessages,
    shouldStop,
    phase,
    reset,
  };
}
