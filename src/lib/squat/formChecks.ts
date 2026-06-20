import { LANDMARKS, BALANCE_THRESHOLD } from "./constants";
import type { CalibrationData } from "./types";

interface Landmark { x: number; y: number; z: number; visibility?: number }

export interface FrameAnalysis {
  depthRatio: number;
  isBalanceLoss: boolean;
}

export function analyzeFrame(landmarks: Landmark[], calibration: CalibrationData): FrameAnalysis {
  const hipMidY = (landmarks[LANDMARKS.LEFT_HIP].y + landmarks[LANDMARKS.RIGHT_HIP].y) / 2;
  const kneeMidY = (landmarks[LANDMARKS.LEFT_KNEE].y + landmarks[LANDMARKS.RIGHT_KNEE].y) / 2;
  const depthRatio = (kneeMidY - hipMidY) / calibration.standingHipKneeDelta;

  const shoulderMidX = (landmarks[LANDMARKS.LEFT_SHOULDER].x + landmarks[LANDMARKS.RIGHT_SHOULDER].x) / 2;
  const hipMidX = (landmarks[LANDMARKS.LEFT_HIP].x + landmarks[LANDMARKS.RIGHT_HIP].x) / 2;
  const currentOffset = Math.abs(shoulderMidX - hipMidX);
  const standingOffset = Math.abs(calibration.standingShoulderMidX - calibration.standingHipMidX);
  // Compare against calibrated standing offset — only flag if it INCREASED significantly
  const isBalanceLoss = (currentOffset - standingOffset) > BALANCE_THRESHOLD;

  return { depthRatio, isBalanceLoss };
}
