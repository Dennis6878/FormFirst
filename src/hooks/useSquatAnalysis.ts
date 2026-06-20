"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type { PoseLandmarkerResult } from "@mediapipe/tasks-vision";
import { AnalysisStage, type CalibrationData, type RepLog } from "@/lib/squat/types";
import {
  LANDMARKS,
  CALIBRATION_FRAMES,
  CALIBRATION_STABILITY,
  MIN_VISIBILITY,
  DEPTH_GOOD_MIN,
  DEPTH_GOOD_MAX,
  CONSECUTIVE_BALANCE_FOR_STOP,
} from "@/lib/squat/constants";
import { createInitialState, transition, type StateMachineState } from "@/lib/squat/stateMachine";
import { analyzeFrame } from "@/lib/squat/formChecks";
import { useWorkout } from "@/context/WorkoutContext";

interface Landmark { x: number; y: number; z: number; visibility?: number }

export type SkeletonColor = "blue" | "green" | "red";

const REQUIRED_LANDMARKS = [
  LANDMARKS.LEFT_HIP, LANDMARKS.RIGHT_HIP,
  LANDMARKS.LEFT_KNEE, LANDMARKS.RIGHT_KNEE,
  LANDMARKS.LEFT_SHOULDER, LANDMARKS.RIGHT_SHOULDER,
];

function landmarksOk(lm: Landmark[]): boolean {
  return REQUIRED_LANDMARKS.every((i) => (lm[i]?.visibility ?? 0) >= MIN_VISIBILITY);
}

export function useSquatAnalysis(poseResult: PoseLandmarkerResult | null) {
  const { addRep, setCalibration: setCtxCalibration } = useWorkout();

  const [stage, setStage] = useState<AnalysisStage>(AnalysisStage.WAITING);
  const [calibration, setCalibration] = useState<CalibrationData | null>(null);
  const [repCount, setRepCount] = useState(0);
  const [feedbackMessages, setFeedbackMessages] = useState<string[]>([]);
  const [shouldStop, setShouldStop] = useState(false);
  const [skeletonColor, setSkeletonColor] = useState<SkeletonColor>("blue");

  const fsmRef = useRef<StateMachineState>(createInitialState());
  const calibFramesRef = useRef<Landmark[][]>([]);
  const consecutiveBalanceRef = useRef(0);
  const repErrorsRef = useRef<string[]>([]);
  const feedbackTimerRef = useRef(false);

  // --- Calibration ---
  const calibrate = useCallback((landmarks: Landmark[]) => {
    if (!landmarksOk(landmarks)) { calibFramesRef.current = []; return; }

    calibFramesRef.current.push(landmarks);
    if (calibFramesRef.current.length < CALIBRATION_FRAMES) return;

    const frames = calibFramesRef.current;
    const hipYs = frames.map((f) => (f[LANDMARKS.LEFT_HIP].y + f[LANDMARKS.RIGHT_HIP].y) / 2);
    if (Math.max(...hipYs) - Math.min(...hipYs) > CALIBRATION_STABILITY) {
      calibFramesRef.current = calibFramesRef.current.slice(-10);
      return;
    }

    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const al = Array.from({ length: 33 }, (_, i) => ({
      x: avg(frames.map((f) => f[i].x)),
      y: avg(frames.map((f) => f[i].y)),
      z: avg(frames.map((f) => f[i].z)),
    }));

    const hipY = (al[LANDMARKS.LEFT_HIP].y + al[LANDMARKS.RIGHT_HIP].y) / 2;
    const kneeY = (al[LANDMARKS.LEFT_KNEE].y + al[LANDMARKS.RIGHT_KNEE].y) / 2;
    const delta = kneeY - hipY;
    if (delta < 0.01) { calibFramesRef.current = []; return; }

    const data: CalibrationData = {
      standingHipKneeDelta: delta,
      standingShoulderMidX: (al[LANDMARKS.LEFT_SHOULDER].x + al[LANDMARKS.RIGHT_SHOULDER].x) / 2,
      standingHipMidX: (al[LANDMARKS.LEFT_HIP].x + al[LANDMARKS.RIGHT_HIP].x) / 2,
    };

    setCalibration(data);
    setCtxCalibration(data);
    setStage(AnalysisStage.ACTIVE);
    fsmRef.current = createInitialState();
  }, [setCtxCalibration]);

  // --- Main loop ---
  useEffect(() => {
    if (!poseResult?.landmarks?.[0]) return;
    const lm = poseResult.landmarks[0] as Landmark[];
    if (lm.length < 33) return;

    if (stage === AnalysisStage.WAITING) {
      setStage(AnalysisStage.CALIBRATING);
      calibFramesRef.current = [];
      return;
    }
    if (stage === AnalysisStage.CALIBRATING) { calibrate(lm); return; }
    if (stage !== AnalysisStage.ACTIVE || !calibration) return;
    if (!landmarksOk(lm)) return;

    // 1. Analyze frame
    const { depthRatio, isBalanceLoss } = analyzeFrame(lm, calibration);

    // 2. FSM
    const { newState, repCompleted } = transition(fsmRef.current, lm, calibration);
    fsmRef.current = newState;

    // 3. Skeleton color
    if (isBalanceLoss || depthRatio < DEPTH_GOOD_MIN) {
      setSkeletonColor("red");
    } else if (depthRatio <= DEPTH_GOOD_MAX && newState.isDown) {
      setSkeletonColor("green");
    } else {
      setSkeletonColor("blue");
    }

    // 4. Collect errors during rep
    if (isBalanceLoss && !repErrorsRef.current.includes("Balance loss")) {
      repErrorsRef.current.push("Balance loss");
    }
    if (depthRatio < DEPTH_GOOD_MIN && !repErrorsRef.current.includes("Too deep")) {
      repErrorsRef.current.push("Too deep");
    }
    if (newState.isDown && depthRatio > DEPTH_GOOD_MAX && !repErrorsRef.current.includes("Not deep enough")) {
      repErrorsRef.current.push("Not deep enough");
    }

    // 5. Live feedback for dangerous errors (balance loss + too deep)
    if (!feedbackTimerRef.current) {
      const live: string[] = [];
      if (isBalanceLoss) live.push("Balance loss");
      if (depthRatio < DEPTH_GOOD_MIN) live.push("Too deep");
      if (live.length > 0) {
        setFeedbackMessages(live);
      } else {
        setFeedbackMessages([]);
      }
    }

    // 6. Rep completed
    if (repCompleted) {
      const errors = [...repErrorsRef.current];
      addRep({ repNumber: newState.repCount, errors, timestamp: Date.now() });
      setRepCount(newState.repCount);

      // Show feedback
      setFeedbackMessages(errors.length > 0 ? errors : ["Good rep!"]);
      feedbackTimerRef.current = true;
      setTimeout(() => {
        feedbackTimerRef.current = false;
        setFeedbackMessages([]);
      }, 2000);

      // Consecutive balance check
      if (errors.includes("Balance loss")) {
        consecutiveBalanceRef.current += 1;
      } else {
        consecutiveBalanceRef.current = 0;
      }
      if (consecutiveBalanceRef.current >= CONSECUTIVE_BALANCE_FOR_STOP) {
        setShouldStop(true);
      }

      repErrorsRef.current = [];
    }
  }, [poseResult, stage, calibration, calibrate, addRep]);

  const reset = useCallback(() => {
    fsmRef.current = createInitialState();
    calibFramesRef.current = [];
    consecutiveBalanceRef.current = 0;
    repErrorsRef.current = [];
    feedbackTimerRef.current = false;
    setStage(AnalysisStage.WAITING);
    setCalibration(null);
    setRepCount(0);
    setFeedbackMessages([]);
    setShouldStop(false);
    setSkeletonColor("blue");
  }, []);

  return { stage, repCount, feedbackMessages, shouldStop, skeletonColor, reset };
}
