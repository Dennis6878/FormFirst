"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type { PoseLandmarkerResult } from "@mediapipe/tasks-vision";
import { AnalysisStage, type CalibrationData, type RepLog } from "@/lib/squat/types";
import {
  LANDMARKS,
  CALIBRATION_FRAMES,
  CALIBRATION_STABILITY_THRESHOLD,
  CONSECUTIVE_ERROR_REPS_FOR_STOP,
  MIN_LANDMARK_VISIBILITY,
  DEPTH_SUFFICIENT_RATIO,
  DEPTH_TOO_LOW_RATIO,
} from "@/lib/squat/constants";
import { createInitialState, transition, type StateMachineState } from "@/lib/squat/stateMachine";
import { checkKneeValgus, checkTrunkShift, checkDepth, runAllChecks } from "@/lib/squat/formChecks";
import { useWorkout } from "@/context/WorkoutContext";

interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

function landmarksValid(landmarks: Landmark[]): boolean {
  const required = [
    LANDMARKS.LEFT_HIP, LANDMARKS.RIGHT_HIP,
    LANDMARKS.LEFT_KNEE, LANDMARKS.RIGHT_KNEE,
    LANDMARKS.LEFT_ANKLE, LANDMARKS.RIGHT_ANKLE,
    LANDMARKS.LEFT_SHOULDER, LANDMARKS.RIGHT_SHOULDER,
  ];
  return required.every((idx) => (landmarks[idx]?.visibility ?? 0) >= MIN_LANDMARK_VISIBILITY);
}

const REP_FEEDBACK_DISPLAY_MS = 2000;

export type SkeletonColor = "blue" | "green" | "red";

export function useSquatAnalysis(poseResult: PoseLandmarkerResult | null) {
  const { addRep, setCalibration: setCtxCalibration } = useWorkout();

  const [stage, setStage] = useState<AnalysisStage>(AnalysisStage.WAITING);
  const [calibration, setCalibration] = useState<CalibrationData | null>(null);
  const [repCount, setRepCount] = useState(0);
  const [feedbackMessages, setFeedbackMessages] = useState<string[]>([]);
  const [shouldStop, setShouldStop] = useState(false);
  const [phase, setPhase] = useState("UP");
  const [hasLiveError, setHasLiveError] = useState(false);
  const [skeletonColor, setSkeletonColor] = useState<SkeletonColor>("blue");

  const fsmRef = useRef<StateMachineState>(createInitialState());
  const calibFramesRef = useRef<Landmark[][]>([]);
  const consecutiveCriticalRef = useRef(0);
  const currentRepErrorsRef = useRef<string[]>([]);
  const repFeedbackActiveRef = useRef(false);

  const calibrate = useCallback((landmarks: Landmark[]) => {
    if (!landmarksValid(landmarks)) {
      calibFramesRef.current = [];
      return;
    }

    calibFramesRef.current.push(landmarks);

    if (calibFramesRef.current.length < CALIBRATION_FRAMES) return;

    const frames = calibFramesRef.current;

    const hipYs = frames.map((f) => (f[LANDMARKS.LEFT_HIP].y + f[LANDMARKS.RIGHT_HIP].y) / 2);
    if (Math.max(...hipYs) - Math.min(...hipYs) > CALIBRATION_STABILITY_THRESHOLD) {
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
    const delta = kneeMidY - hipMidY;

    if (delta < 0.01) {
      calibFramesRef.current = [];
      return;
    }

    const data: CalibrationData = {
      standingHipY: hipMidY,
      standingKneeY: kneeMidY,
      standingHipKneeDelta: delta,
      standingKneeDistance: Math.abs(avgLandmarks[LANDMARKS.LEFT_KNEE].x - avgLandmarks[LANDMARKS.RIGHT_KNEE].x),
      standingAnkleDistance: Math.abs(avgLandmarks[LANDMARKS.LEFT_ANKLE].x - avgLandmarks[LANDMARKS.RIGHT_ANKLE].x),
      standingShoulderMidX: (avgLandmarks[LANDMARKS.LEFT_SHOULDER].x + avgLandmarks[LANDMARKS.RIGHT_SHOULDER].x) / 2,
      standingHipMidX: (avgLandmarks[LANDMARKS.LEFT_HIP].x + avgLandmarks[LANDMARKS.RIGHT_HIP].x) / 2,
    };

    setCalibration(data);
    setCtxCalibration(data);
    setStage(AnalysisStage.ACTIVE);
    fsmRef.current = createInitialState();
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
    if (!landmarksValid(landmarks)) return;

    // Run FSM
    const { newState, repCompleted, depthRatio } = transition(fsmRef.current, landmarks, calibration);
    fsmRef.current = newState;
    setPhase(newState.isDown ? "DOWN" : "UP");

    // Collect errors for per-rep logging
    const { errors: allErrors } = runAllChecks(landmarks, calibration);
    if (allErrors.length > 0) {
      for (const err of allErrors) {
        if (!currentRepErrorsRef.current.includes(err)) {
          currentRepErrorsRef.current.push(err);
        }
      }
    }

    // Check all live errors for skeleton color
    const valgus = checkKneeValgus(landmarks, calibration);
    const trunk = checkTrunkShift(landmarks, calibration);
    const depth = checkDepth(landmarks, calibration);

    const liveErrors: string[] = [];
    if (!valgus.passed) liveErrors.push(valgus.message);
    if (!trunk.passed) liveErrors.push(trunk.message);
    // "Too low" is shown live (dangerous), "Go deeper" only after rep
    if (!depth.passed && depth.message === "Too low") liveErrors.push(depth.message);

    const hasAnyCritical = liveErrors.length > 0;

    // Skeleton color: red on any live error, green at good depth, blue otherwise
    if (hasAnyCritical) {
      setSkeletonColor("red");
      setHasLiveError(true);
    } else if (depthRatio <= DEPTH_SUFFICIENT_RATIO && depthRatio >= DEPTH_TOO_LOW_RATIO && newState.isDown) {
      setSkeletonColor("green");
      setHasLiveError(false);
    } else {
      setSkeletonColor("blue");
      setHasLiveError(false);
    }

    // Show live errors
    if (hasAnyCritical && !repFeedbackActiveRef.current) {
      setFeedbackMessages(liveErrors);
    }

    if (repCompleted) {
      const errors = [...currentRepErrorsRef.current];
      const repLog: RepLog = {
        repNumber: newState.repCount,
        errors,
        timestamp: Date.now(),
      };
      addRep(repLog);
      setRepCount(newState.repCount);

      if (errors.length > 0) {
        setFeedbackMessages(errors);
        setHasLiveError(true);
      } else {
        setFeedbackMessages(["Good rep!"]);
        setHasLiveError(false);
      }
      repFeedbackActiveRef.current = true;
      setTimeout(() => {
        repFeedbackActiveRef.current = false;
        setFeedbackMessages([]);
        setHasLiveError(false);
      }, REP_FEEDBACK_DISPLAY_MS);

      if (errors.some((e) => e === "Knees caving in" || e === "Shift weight to center")) {
        consecutiveCriticalRef.current += 1;
      } else {
        consecutiveCriticalRef.current = 0;
      }

      if (consecutiveCriticalRef.current >= CONSECUTIVE_ERROR_REPS_FOR_STOP) {
        setShouldStop(true);
      }

      currentRepErrorsRef.current = [];
    } else if (!hasAnyCritical && !repFeedbackActiveRef.current) {
      setFeedbackMessages([]);
    }
  }, [poseResult, stage, calibration, calibrate, addRep]);

  const reset = useCallback(() => {
    fsmRef.current = createInitialState();
    calibFramesRef.current = [];
    consecutiveCriticalRef.current = 0;
    currentRepErrorsRef.current = [];
    repFeedbackActiveRef.current = false;
    setStage(AnalysisStage.WAITING);
    setCalibration(null);
    setRepCount(0);
    setFeedbackMessages([]);
    setShouldStop(false);
    setHasLiveError(false);
    setSkeletonColor("blue");
  }, []);

  return {
    stage,
    repCount,
    feedbackMessages,
    shouldStop,
    phase,
    hasLiveError,
    skeletonColor,
    reset,
  };
}
