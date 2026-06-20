import { LANDMARKS, DOWN_THRESHOLD, UP_THRESHOLD, MIN_REP_INTERVAL_MS, MIN_VISIBILITY } from "./constants";
import type { CalibrationData } from "./types";

interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface StateMachineState {
  isDown: boolean;
  repCount: number;
  lastRepTime: number;
  framesSinceCalibration: number;
  hasBeenDown: boolean;
}

export function createInitialState(): StateMachineState {
  return { isDown: false, repCount: 0, lastRepTime: 0, framesSinceCalibration: 0, hasBeenDown: false };
}

function visible(landmarks: Landmark[]): boolean {
  return [LANDMARKS.LEFT_HIP, LANDMARKS.RIGHT_HIP, LANDMARKS.LEFT_KNEE, LANDMARKS.RIGHT_KNEE]
    .every((i) => (landmarks[i].visibility ?? 0) >= MIN_VISIBILITY);
}

function depthRatio(landmarks: Landmark[], cal: CalibrationData): number {
  const hipY = (landmarks[LANDMARKS.LEFT_HIP].y + landmarks[LANDMARKS.RIGHT_HIP].y) / 2;
  const kneeY = (landmarks[LANDMARKS.LEFT_KNEE].y + landmarks[LANDMARKS.RIGHT_KNEE].y) / 2;
  return (kneeY - hipY) / cal.standingHipKneeDelta;
}

export interface TransitionResult {
  newState: StateMachineState;
  repCompleted: boolean;
}

export function transition(state: StateMachineState, landmarks: Landmark[], cal: CalibrationData): TransitionResult {
  if (!visible(landmarks)) return { newState: state, repCompleted: false };

  const ratio = depthRatio(landmarks, cal);
  const newState = { ...state, framesSinceCalibration: state.framesSinceCalibration + 1 };

  if (newState.framesSinceCalibration < 8) return { newState, repCompleted: false };

  let repCompleted = false;

  if (!state.isDown && ratio < DOWN_THRESHOLD) {
    newState.isDown = true;
    newState.hasBeenDown = true;
  } else if (state.isDown && ratio > UP_THRESHOLD) {
    newState.isDown = false;
    if (state.hasBeenDown && Date.now() - state.lastRepTime > MIN_REP_INTERVAL_MS) {
      newState.repCount = state.repCount + 1;
      newState.lastRepTime = Date.now();
      repCompleted = true;
    }
  }

  return { newState, repCompleted };
}
