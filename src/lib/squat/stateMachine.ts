import { SquatPhase } from "./types";
import {
  LANDMARKS,
  DESCENT_THRESHOLD_RATIO,
  ASCENT_THRESHOLD_RATIO,
  MIN_MOVEMENT_THRESHOLD,
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
  maxDepthRatio: number;
}

export function createInitialState(): StateMachineState {
  return {
    phase: SquatPhase.STANDING,
    repCount: 0,
    firstRepValidated: false,
    maxDepthRatio: 1,
  };
}

export function getDepthRatio(landmarks: Landmark[], calibration: CalibrationData): number {
  const leftHip = landmarks[LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[LANDMARKS.RIGHT_HIP];
  const leftKnee = landmarks[LANDMARKS.LEFT_KNEE];
  const rightKnee = landmarks[LANDMARKS.RIGHT_KNEE];

  const hipMidY = (leftHip.y + rightHip.y) / 2;
  const kneeMidY = (leftKnee.y + rightKnee.y) / 2;
  const currentDelta = kneeMidY - hipMidY;

  return currentDelta / calibration.standingHipKneeDelta;
}

export interface TransitionResult {
  newState: StateMachineState;
  repCompleted: boolean;
}

export function transition(
  state: StateMachineState,
  landmarks: Landmark[],
  calibration: CalibrationData
): TransitionResult {
  const ratio = getDepthRatio(landmarks, calibration);
  const newState = { ...state };
  let repCompleted = false;

  newState.maxDepthRatio = Math.min(state.maxDepthRatio, ratio);

  switch (state.phase) {
    case SquatPhase.STANDING:
      if (ratio < DESCENT_THRESHOLD_RATIO) {
        newState.phase = SquatPhase.DESCENDING;
        newState.maxDepthRatio = ratio;
      }
      break;

    case SquatPhase.DESCENDING:
      if (ratio < DESCENT_THRESHOLD_RATIO * 0.85) {
        newState.phase = SquatPhase.BOTTOM;
      } else if (ratio > ASCENT_THRESHOLD_RATIO) {
        newState.phase = SquatPhase.STANDING;
        newState.maxDepthRatio = 1;
      }
      break;

    case SquatPhase.BOTTOM:
      if (ratio > DESCENT_THRESHOLD_RATIO) {
        newState.phase = SquatPhase.ASCENDING;
      }
      break;

    case SquatPhase.ASCENDING:
      if (ratio > ASCENT_THRESHOLD_RATIO) {
        const movementRange = 1 - newState.maxDepthRatio;
        if (movementRange > MIN_MOVEMENT_THRESHOLD) {
          if (state.firstRepValidated) {
            newState.repCount = state.repCount + 1;
            repCompleted = true;
          } else {
            newState.firstRepValidated = true;
            newState.repCount = 1;
            repCompleted = true;
          }
        }
        newState.phase = SquatPhase.STANDING;
        newState.maxDepthRatio = 1;
      } else if (ratio < DESCENT_THRESHOLD_RATIO * 0.85) {
        newState.phase = SquatPhase.BOTTOM;
      }
      break;
  }

  return { newState, repCompleted };
}
