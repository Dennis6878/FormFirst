import { LANDMARKS, DOWN_THRESHOLD, UP_THRESHOLD, MIN_REP_INTERVAL_MS, MIN_VISIBILITY } from "./constants";
import type { CalibrationData } from "./types";

interface Landmark { x: number; y: number; z: number; visibility?: number }

export interface StateMachineState {
  isDown: boolean;
  repCount: number;
  lastRepTime: number;
  framesSinceCalibration: number;
  hasBeenDown: boolean;
  minDepthThisRep: number;
}

export function createInitialState(): StateMachineState {
  return { isDown: false, repCount: 0, lastRepTime: 0, framesSinceCalibration: 0, hasBeenDown: false, minDepthThisRep: 1 };
}

function visible(lm: Landmark[]): boolean {
  return [LANDMARKS.LEFT_HIP, LANDMARKS.RIGHT_HIP, LANDMARKS.LEFT_KNEE, LANDMARKS.RIGHT_KNEE]
    .every((i) => (lm[i].visibility ?? 0) >= MIN_VISIBILITY);
}

export function getDepthRatio(lm: Landmark[], cal: CalibrationData): number {
  const hipY = (lm[LANDMARKS.LEFT_HIP].y + lm[LANDMARKS.RIGHT_HIP].y) / 2;
  const kneeY = (lm[LANDMARKS.LEFT_KNEE].y + lm[LANDMARKS.RIGHT_KNEE].y) / 2;
  return (kneeY - hipY) / cal.standingHipKneeDelta;
}

export interface TransitionResult {
  newState: StateMachineState;
  repCompleted: boolean;
  minDepth: number;
}

export function transition(state: StateMachineState, lm: Landmark[], cal: CalibrationData): TransitionResult {
  if (!visible(lm)) return { newState: state, repCompleted: false, minDepth: state.minDepthThisRep };

  const ratio = getDepthRatio(lm, cal);
  const newState = { ...state, framesSinceCalibration: state.framesSinceCalibration + 1 };

  if (newState.framesSinceCalibration < 8) return { newState, repCompleted: false, minDepth: 1 };

  // Track deepest point during this rep
  if (newState.isDown || ratio < DOWN_THRESHOLD) {
    newState.minDepthThisRep = Math.min(state.minDepthThisRep, ratio);
  }

  let repCompleted = false;
  let minDepth = state.minDepthThisRep;

  if (!state.isDown && ratio < DOWN_THRESHOLD) {
    newState.isDown = true;
    newState.hasBeenDown = true;
    newState.minDepthThisRep = ratio;
  } else if (state.isDown && ratio > UP_THRESHOLD) {
    newState.isDown = false;
    if (state.hasBeenDown && Date.now() - state.lastRepTime > MIN_REP_INTERVAL_MS) {
      newState.repCount = state.repCount + 1;
      newState.lastRepTime = Date.now();
      repCompleted = true;
      minDepth = newState.minDepthThisRep;
    }
    newState.minDepthThisRep = 1;
  }

  return { newState, repCompleted, minDepth };
}
