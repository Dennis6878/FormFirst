import {
  LANDMARKS,
  DOWN_THRESHOLD,
  UP_THRESHOLD,
  MIN_REP_INTERVAL_MS,
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
  isDown: boolean;
  repCount: number;
  lastRepTime: number;
  framesSinceCalibration: number;
  hasBeenDown: boolean;
}

export function createInitialState(): StateMachineState {
  return {
    isDown: false,
    repCount: 0,
    lastRepTime: 0,
    framesSinceCalibration: 0,
    hasBeenDown: false,
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

function areLandmarksVisible(landmarks: Landmark[]): boolean {
  const required = [LANDMARKS.LEFT_HIP, LANDMARKS.RIGHT_HIP, LANDMARKS.LEFT_KNEE, LANDMARKS.RIGHT_KNEE];
  return required.every((idx) => (landmarks[idx].visibility ?? 0) >= MIN_LANDMARK_VISIBILITY);
}

export interface TransitionResult {
  newState: StateMachineState;
  repCompleted: boolean;
  depthRatio: number;
}

export function transition(
  state: StateMachineState,
  landmarks: Landmark[],
  calibration: CalibrationData,
): TransitionResult {
  const noChange = { newState: state, repCompleted: false, depthRatio: 1 };

  if (!areLandmarksVisible(landmarks)) return noChange;

  const ratio = getDepthRatio(landmarks, calibration);

  const newState: StateMachineState = {
    ...state,
    framesSinceCalibration: state.framesSinceCalibration + 1,
  };

  // Ignore first few frames after calibration
  if (newState.framesSinceCalibration < 8) {
    return { newState, repCompleted: false, depthRatio: ratio };
  }

  let repCompleted = false;
  const now = Date.now();

  if (!state.isDown && ratio < DOWN_THRESHOLD) {
    // User went down
    newState.isDown = true;
    newState.hasBeenDown = true;
  } else if (state.isDown && ratio > UP_THRESHOLD) {
    // User came back up
    newState.isDown = false;
    const timeSinceLastRep = now - state.lastRepTime;

    if (state.hasBeenDown && timeSinceLastRep > MIN_REP_INTERVAL_MS) {
      newState.repCount = state.repCount + 1;
      newState.lastRepTime = now;
      repCompleted = true;
    }
  }

  return { newState, repCompleted, depthRatio: ratio };
}
