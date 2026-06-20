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
} from "@/lib/squat/constants";
import { createInitialState, transition, type StateMachineState } from "@/lib/squat/stateMachine";
import { runAllChecks } from "@/lib/squat/formChecks";
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
  const confirmDownRef = useRef(0);
  const confirmUpRef = useRef(0);

  const calibrate = useCallback((landmarks: Landmark[]) => {
    if (!landmarksValid(landmarks)) {
      calibFramesRef.current = [];
      return;
    }

    calibFramesRef.current.push(landmarks);

    if (calibFramesRef.current.length < CALIBRATION_FRAMES) return;

    const frames = calibFramesRef.current;

    // Check stability: hip Y should not vary much
    const hipYs = frames.map((f) => (f[LANDMARKS.LEFT_HIP].y + f[LANDMARKS.RIGHT_HIP].y) / 2);
    const minY = Math.min(...hipYs);
    const maxY = Math.max(...hipYs);

    if (maxY - minY > CALIBRATION_STABILITY_THRESHOLD) {
      // Still moving — keep most recent frames and try again
      calibFramesRef.current = calibFramesRef.current.slice(-15);
      return;
    }

    // Also check knee stability
    const kneeYs = frames.map((f) => (f[LANDMARKS.LEFT_KNEE].y + f[LANDMARKS.RIGHT_KNEE].y) / 2);
    const kneeRange = Math.max(...kneeYs) - Math.min(...kneeYs);
    if (kneeRange > CALIBRATION_STABILITY_THRESHOLD) {
      calibFramesRef.current = calibFramesRef.current.slice(-15);
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

    // Sanity check: hip should be above knee (lower Y in normalized coords)
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

    // Skip frame if key landmarks aren't visible
    if (!landmarksValid(landmarks)) {
      setFeedbackMessages([]);
      return;
    }

    const { errors } = runAllChecks(landmarks, calibration);

    if (errors.length > 0) {
      for (const err of errors) {
        if (!currentRepErrorsRef.current.includes(err)) {
          currentRepErrorsRef.current.push(err);
        }
      }
    }

    setFeedbackMessages(errors);

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
  }, [poseResult, stage, calibration, calibrate, addRep]);

  const reset = useCallback(() => {
    fsmRef.current = createInitialState();
    calibFramesRef.current = [];
    consecutiveCriticalRef.current = 0;
    currentRepErrorsRef.current = [];
    confirmDownRef.current = 0;
    confirmUpRef.current = 0;
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
