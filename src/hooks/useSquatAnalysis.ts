"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type { PoseLandmarkerResult } from "@mediapipe/tasks-vision";
import { AnalysisStage, SquatPhase, type CalibrationData, type RepLog } from "@/lib/squat/types";
import {
  LANDMARKS,
  CALIBRATION_FRAMES,
  CALIBRATION_STABILITY_THRESHOLD,
  CONSECUTIVE_ERROR_REPS_FOR_STOP,
  MIN_LANDMARK_VISIBILITY,
  DEPTH_SUFFICIENT_RATIO,
  DEPTH_TOO_LOW_RATIO,
} from "@/lib/squat/constants";
import { createInitialState, transition, getDepthRatio, type StateMachineState } from "@/lib/squat/stateMachine";
import { checkKneeValgus, checkTrunkShift, runAllChecks } from "@/lib/squat/formChecks";
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
  const [phase, setPhase] = useState("STANDING");
  const [hasLiveError, setHasLiveError] = useState(false);
  const [skeletonColor, setSkeletonColor] = useState<SkeletonColor>("blue");

  const fsmRef = useRef<StateMachineState>(createInitialState());
  const calibFramesRef = useRef<Landmark[][]>([]);
  const consecutiveCriticalRef = useRef(0);
  const currentRepErrorsRef = useRef<string[]>([]);
  const confirmDownRef = useRef(0);
  const confirmUpRef = useRef(0);
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

    const kneeYs = frames.map((f) => (f[LANDMARKS.LEFT_KNEE].y + f[LANDMARKS.RIGHT_KNEE].y) / 2);
    if (Math.max(...kneeYs) - Math.min(...kneeYs) > CALIBRATION_STABILITY_THRESHOLD) {
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

    if (delta < 0.02) {
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
    confirmDownRef.current = 0;
    confirmUpRef.current = 0;
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

    // Collect all errors for per-rep logging
    const { errors: allErrors } = runAllChecks(landmarks, calibration);

    if (allErrors.length > 0) {
      for (const err of allErrors) {
        if (!currentRepErrorsRef.current.includes(err)) {
          currentRepErrorsRef.current.push(err);
        }
      }
    }

    // Check live critical errors (valgus, trunk shift)
    const liveErrors: string[] = [];
    const valgusResult = checkKneeValgus(landmarks, calibration);
    if (!valgusResult.passed) liveErrors.push(valgusResult.message);
    const trunkResult = checkTrunkShift(landmarks, calibration);
    if (!trunkResult.passed) liveErrors.push(trunkResult.message);

    const hasLiveCritical = liveErrors.length > 0;

    // Determine skeleton color based on depth + errors
    const depthRatio = getDepthRatio(landmarks, calibration);
    const currentPhase = fsmRef.current.phase;

    if (hasLiveCritical) {
      setSkeletonColor("red");
      setHasLiveError(true);
    } else if (
      depthRatio <= DEPTH_SUFFICIENT_RATIO &&
      depthRatio >= DEPTH_TOO_LOW_RATIO &&
      (currentPhase === SquatPhase.BOTTOM || currentPhase === SquatPhase.DESCENDING)
    ) {
      setSkeletonColor("green");
      setHasLiveError(false);
    } else {
      setSkeletonColor("blue");
      setHasLiveError(false);
    }

    // Show live critical errors immediately
    if (hasLiveCritical && !repFeedbackActiveRef.current) {
      setFeedbackMessages(liveErrors);
    }

    // Run FSM transition
    const { newState, repCompleted } = transition(
      fsmRef.current,
      landmarks,
      calibration,
      confirmDownRef,
      confirmUpRef,
    );
    fsmRef.current = newState;
    setPhase(newState.phase);

    if (repCompleted) {
      const errors = [...currentRepErrorsRef.current];
      const repLog: RepLog = {
        repNumber: newState.repCount,
        errors,
        timestamp: Date.now(),
      };
      addRep(repLog);
      setRepCount(newState.repCount);

      // Show rep feedback
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
    } else if (!hasLiveCritical && !repFeedbackActiveRef.current) {
      setFeedbackMessages([]);
    }
  }, [poseResult, stage, calibration, calibrate, addRep]);

  const reset = useCallback(() => {
    fsmRef.current = createInitialState();
    calibFramesRef.current = [];
    consecutiveCriticalRef.current = 0;
    currentRepErrorsRef.current = [];
    confirmDownRef.current = 0;
    confirmUpRef.current = 0;
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
