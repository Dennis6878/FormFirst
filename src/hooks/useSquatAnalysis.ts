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

const REQUIRED = [
  LANDMARKS.LEFT_HIP, LANDMARKS.RIGHT_HIP,
  LANDMARKS.LEFT_KNEE, LANDMARKS.RIGHT_KNEE,
  LANDMARKS.LEFT_SHOULDER, LANDMARKS.RIGHT_SHOULDER,
];

function landmarksOk(lm: Landmark[]): boolean {
  return REQUIRED.every((i) => (lm[i]?.visibility ?? 0) >= MIN_VISIBILITY);
}

export function useSquatAnalysis(poseResult: PoseLandmarkerResult | null, targetReps: number = 8) {
  const { addRep, setCalibration: setCtxCalibration } = useWorkout();

  const [stage, setStage] = useState<AnalysisStage>(AnalysisStage.WAITING);
  const [calibration, setCalibration] = useState<CalibrationData | null>(null);
  const [repCount, setRepCount] = useState(0);
  const [feedbackMessages, setFeedbackMessages] = useState<string[]>([]);
  const [shouldStop, setShouldStop] = useState(false);
  const [skeletonColor, setSkeletonColor] = useState<SkeletonColor>("blue");
  const [countdown, setCountdown] = useState(0);

  const fsmRef = useRef<StateMachineState>(createInitialState());
  const calibFramesRef = useRef<Landmark[][]>([]);
  const consecutiveBalanceRef = useRef(0);
  const hadBalanceLossRef = useRef(false);
  const feedbackTimerRef = useRef(false);

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
    setStage(AnalysisStage.COUNTDOWN);
    setCountdown(10);
  }, [setCtxCalibration]);

  useEffect(() => {
    if (stage !== AnalysisStage.COUNTDOWN || countdown <= 0) return;
    const t = setTimeout(() => {
      if (countdown <= 1) {
        setStage(AnalysisStage.ACTIVE);
        fsmRef.current = createInitialState();
        setCountdown(0);
      } else {
        setCountdown(countdown - 1);
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [stage, countdown]);

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

    const { depthRatio, isBalanceLoss } = analyzeFrame(lm, calibration);
    const { newState, repCompleted, minDepth } = transition(fsmRef.current, lm, calibration);
    fsmRef.current = newState;

    // Track balance loss during the down phase of this rep
    if (isBalanceLoss && newState.isDown) {
      hadBalanceLossRef.current = true;
    }

    // Skeleton color:
    // - Red: balance loss OR too deep (only while actually squatting)
    // - Green: in good depth zone AND in down state
    // - Blue: everything else (standing, descending before good zone, ascending)
    if (newState.isDown && (isBalanceLoss || depthRatio < DEPTH_GOOD_MIN)) {
      setSkeletonColor("red");
    } else if (newState.isDown && depthRatio >= DEPTH_GOOD_MIN && depthRatio <= DEPTH_GOOD_MAX) {
      setSkeletonColor("green");
    } else {
      setSkeletonColor("blue");
    }

    // NO live feedback text between reps — feedback ONLY shown after rep completes
    // (feedbackTimerRef controls this: true = showing post-rep feedback, false = clear)
    if (!feedbackTimerRef.current && !repCompleted) {
      setFeedbackMessages([]);
    }

    // Rep completed → determine ONE error and show feedback
    if (repCompleted) {
      let error: string | null = null;

      if (hadBalanceLossRef.current) {
        error = "Balance loss";
      } else if (minDepth < DEPTH_GOOD_MIN) {
        error = "Too deep";
      } else if (minDepth > DEPTH_GOOD_MAX) {
        error = "Not deep enough";
      }

      const errors = error ? [error] : [];
      addRep({ repNumber: newState.repCount, errors, timestamp: Date.now() });
      setRepCount(newState.repCount);

      setFeedbackMessages(error ? [error] : ["Good rep!"]);
      feedbackTimerRef.current = true;
      setTimeout(() => {
        feedbackTimerRef.current = false;
        setFeedbackMessages([]);
      }, 2000);

      if (error === "Balance loss") {
        consecutiveBalanceRef.current += 1;
      } else {
        consecutiveBalanceRef.current = 0;
      }
      if (consecutiveBalanceRef.current >= CONSECUTIVE_BALANCE_FOR_STOP) {
        setShouldStop(true);
      }

      if (newState.repCount >= targetReps) {
        setStage(AnalysisStage.DONE);
      }

      hadBalanceLossRef.current = false;
    }
  }, [poseResult, stage, calibration, calibrate, addRep, targetReps]);

  const reset = useCallback(() => {
    fsmRef.current = createInitialState();
    calibFramesRef.current = [];
    consecutiveBalanceRef.current = 0;
    hadBalanceLossRef.current = false;
    feedbackTimerRef.current = false;
    setStage(AnalysisStage.WAITING);
    setCalibration(null);
    setRepCount(0);
    setFeedbackMessages([]);
    setShouldStop(false);
    setSkeletonColor("blue");
    setCountdown(0);
  }, []);

  return { stage, repCount, feedbackMessages, shouldStop, skeletonColor, countdown, targetReps, reset };
}
