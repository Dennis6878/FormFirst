import { SquatPhase } from "./types";
import {
  LANDMARKS,
  DESCENT_THRESHOLD_RATIO,
  ASCENT_THRESHOLD_RATIO,
  BOTTOM_THRESHOLD_RATIO,
  MIN_MOVEMENT_THRESHOLD,
  MIN_REP_INTERVAL_MS,
  SMOOTHING_ALPHA,
  MIN_LANDMARK_VISIBILITY,
} from "./constants";
import type { CalibrationData } from "./types";

interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface StateMachineState {
  phase: SquatPhase;
  repCount: number;
  firstRepValidated: boolean;
  peakDepthRatio: number;
  lastRepTime: number;
  smoothedRatio: number;
  framesSinceCalibration: number;
}

const CONFIRM_FRAMES = 2;

export function createInitialState(): StateMachineState {
  return {
    phase: SquatPhase.STANDING,
    repCount: 0,
    firstRepValidated: false,
    peakDepthRatio: 1,
    lastRepTime: 0,
    smoothedRatio: 1,
    framesSinceCalibration: 0,
  };
}

function areLandmarksVisible(landmarks: Landmark[]): boolean {
  const required = [LANDMARKS.LEFT_HIP, LANDMARKS.RIGHT_HIP, LANDMARKS.LEFT_KNEE, LANDMARKS.RIGHT_KNEE];
  return required.every((idx) => (landmarks[idx].visibility ?? 0) >= MIN_LANDMARK_VISIBILITY);
}

function getRawDepthRatio(landmarks: Landmark[], calibration: CalibrationData): number {
  const leftHip = landmarks[LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[LANDMARKS.RIGHT_HIP];
  const leftKnee = landmarks[LANDMARKS.LEFT_KNEE];
  const rightKnee = landmarks[LANDMARKS.RIGHT_KNEE];

  const hipMidY = (leftHip.y + rightHip.y) / 2;
  const kneeMidY = (leftKnee.y + rightKnee.y) / 2;
  const currentDelta = kneeMidY - hipMidY;

  return currentDelta / calibration.standingHipKneeDelta;
}

export function getDepthRatio(landmarks: Landmark[], calibration: CalibrationData): number {
  return getRawDepthRatio(landmarks, calibration);
}

export interface TransitionResult {
  newState: StateMachineState;
  repCompleted: boolean;
}

export function transition(
  state: StateMachineState,
  landmarks: Landmark[],
  calibration: CalibrationData,
  confirmDownRef: { current: number },
  confirmUpRef: { current: number },
): TransitionResult {
  if (!areLandmarksVisible(landmarks)) {
    return { newState: state, repCompleted: false };
  }

  const rawRatio = getRawDepthRatio(landmarks, calibration);
  const smoothed = state.smoothedRatio * (1 - SMOOTHING_ALPHA) + rawRatio * SMOOTHING_ALPHA;

  const newState: StateMachineState = {
    ...state,
    smoothedRatio: smoothed,
    framesSinceCalibration: state.framesSinceCalibration + 1,
  };

  if (newState.framesSinceCalibration < 10) {
    return { newState, repCompleted: false };
  }

  newState.peakDepthRatio = Math.min(state.peakDepthRatio, smoothed);

  let repCompleted = false;
  const now = Date.now();

  switch (state.phase) {
    case SquatPhase.STANDING:
      if (smoothed < DESCENT_THRESHOLD_RATIO) {
        confirmDownRef.current++;
        if (confirmDownRef.current >= CONFIRM_FRAMES) {
          newState.phase = SquatPhase.DESCENDING;
          newState.peakDepthRatio = smoothed;
          confirmDownRef.current = 0;
        }
      } else {
        confirmDownRef.current = 0;
      }
      confirmUpRef.current = 0;
      break;

    case SquatPhase.DESCENDING:
      if (smoothed < BOTTOM_THRESHOLD_RATIO) {
        newState.phase = SquatPhase.BOTTOM;
        confirmDownRef.current = 0;
      } else if (smoothed > ASCENT_THRESHOLD_RATIO) {
        confirmUpRef.current++;
        if (confirmUpRef.current >= CONFIRM_FRAMES) {
          newState.phase = SquatPhase.STANDING;
          newState.peakDepthRatio = 1;
          confirmUpRef.current = 0;
        }
      } else {
        confirmUpRef.current = 0;
      }
      break;

    case SquatPhase.BOTTOM:
      confirmDownRef.current = 0;
      if (smoothed > BOTTOM_THRESHOLD_RATIO + 0.1) {
        confirmUpRef.current++;
        if (confirmUpRef.current >= CONFIRM_FRAMES) {
          newState.phase = SquatPhase.ASCENDING;
          confirmUpRef.current = 0;
        }
      } else {
        confirmUpRef.current = 0;
      }
      break;

    case SquatPhase.ASCENDING:
      if (smoothed > ASCENT_THRESHOLD_RATIO) {
        confirmUpRef.current++;
        if (confirmUpRef.current >= CONFIRM_FRAMES) {
          const movementRange = 1 - newState.peakDepthRatio;
          const timeSinceLastRep = now - state.lastRepTime;

          if (movementRange > MIN_MOVEMENT_THRESHOLD && timeSinceLastRep > MIN_REP_INTERVAL_MS) {
            if (state.firstRepValidated) {
              newState.repCount = state.repCount + 1;
            } else {
              newState.firstRepValidated = true;
              newState.repCount = 1;
            }
            newState.lastRepTime = now;
            repCompleted = true;
          }

          newState.phase = SquatPhase.STANDING;
          newState.peakDepthRatio = 1;
          confirmUpRef.current = 0;
        }
      } else if (smoothed < BOTTOM_THRESHOLD_RATIO) {
        confirmUpRef.current = 0;
        newState.phase = SquatPhase.BOTTOM;
      } else {
        confirmUpRef.current = 0;
      }
      break;
  }

  return { newState, repCompleted };
}
