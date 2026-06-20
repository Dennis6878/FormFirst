import { LANDMARKS, KNEE_OUT_THRESHOLD } from "./constants";
import type { CalibrationData } from "./types";

interface Landmark { x: number; y: number; z: number; visibility?: number }

export interface FrameAnalysis {
  depthRatio: number;
  isKneesTooWide: boolean;
}

export function analyzeFrame(landmarks: Landmark[], calibration: CalibrationData): FrameAnalysis {
  const hipMidY = (landmarks[LANDMARKS.LEFT_HIP].y + landmarks[LANDMARKS.RIGHT_HIP].y) / 2;
  const kneeMidY = (landmarks[LANDMARKS.LEFT_KNEE].y + landmarks[LANDMARKS.RIGHT_KNEE].y) / 2;
  const depthRatio = (kneeMidY - hipMidY) / calibration.standingHipKneeDelta;

  const leftKneeX = landmarks[LANDMARKS.LEFT_KNEE].x;
  const leftAnkleX = landmarks[LANDMARKS.LEFT_ANKLE].x;
  const rightKneeX = landmarks[LANDMARKS.RIGHT_KNEE].x;
  const rightAnkleX = landmarks[LANDMARKS.RIGHT_ANKLE].x;

  // Check if either knee extends further outward than its ankle
  const leftOut = leftAnkleX - leftKneeX;
  const rightOut = rightKneeX - rightAnkleX;
  const isKneesTooWide = leftOut > KNEE_OUT_THRESHOLD || rightOut > KNEE_OUT_THRESHOLD;

  return { depthRatio, isKneesTooWide };
}
