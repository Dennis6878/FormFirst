import type { CalibrationData } from "./types";
import {
  LANDMARKS,
  DEPTH_SUFFICIENT_RATIO,
  DEPTH_TOO_LOW_RATIO,
  VALGUS_RATIO_THRESHOLD,
  TRUNK_SHIFT_THRESHOLD,
} from "./constants";

interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface FormCheckResult {
  passed: boolean;
  message: string;
  isCritical: boolean;
}

export function checkDepth(landmarks: Landmark[], calibration: CalibrationData): FormCheckResult {
  const leftHip = landmarks[LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[LANDMARKS.RIGHT_HIP];
  const leftKnee = landmarks[LANDMARKS.LEFT_KNEE];
  const rightKnee = landmarks[LANDMARKS.RIGHT_KNEE];

  const hipMidY = (leftHip.y + rightHip.y) / 2;
  const kneeMidY = (leftKnee.y + rightKnee.y) / 2;
  const currentDelta = kneeMidY - hipMidY;
  const ratio = currentDelta / calibration.standingHipKneeDelta;

  if (ratio > DEPTH_SUFFICIENT_RATIO) {
    return { passed: false, message: "Go deeper", isCritical: false };
  }
  if (ratio < DEPTH_TOO_LOW_RATIO) {
    return { passed: false, message: "Too low", isCritical: false };
  }
  return { passed: true, message: "", isCritical: false };
}

export function checkKneeValgus(landmarks: Landmark[], calibration: CalibrationData): FormCheckResult {
  const leftKnee = landmarks[LANDMARKS.LEFT_KNEE];
  const rightKnee = landmarks[LANDMARKS.RIGHT_KNEE];
  const leftAnkle = landmarks[LANDMARKS.LEFT_ANKLE];
  const rightAnkle = landmarks[LANDMARKS.RIGHT_ANKLE];

  const kneeDistance = Math.abs(leftKnee.x - rightKnee.x);
  const ankleDistance = Math.abs(leftAnkle.x - rightAnkle.x);

  if (ankleDistance < 0.01) return { passed: true, message: "", isCritical: true };

  const ratio = kneeDistance / ankleDistance;

  if (ratio < VALGUS_RATIO_THRESHOLD) {
    return { passed: false, message: "Knees caving in", isCritical: true };
  }
  return { passed: true, message: "", isCritical: true };
}

export function checkTrunkShift(landmarks: Landmark[], _calibration: CalibrationData): FormCheckResult {
  const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];
  const leftHip = landmarks[LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[LANDMARKS.RIGHT_HIP];

  const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
  const hipMidX = (leftHip.x + rightHip.x) / 2;
  const offset = Math.abs(shoulderMidX - hipMidX);

  if (offset > TRUNK_SHIFT_THRESHOLD) {
    return { passed: false, message: "Shift weight to center", isCritical: true };
  }
  return { passed: true, message: "", isCritical: true };
}

export function runAllChecks(
  landmarks: Landmark[],
  calibration: CalibrationData
): { results: FormCheckResult[]; errors: string[]; hasCriticalError: boolean } {
  const results = [
    checkDepth(landmarks, calibration),
    checkKneeValgus(landmarks, calibration),
    checkTrunkShift(landmarks, calibration),
  ];

  const errors = results.filter((r) => !r.passed).map((r) => r.message);
  const hasCriticalError = results.some((r) => !r.passed && r.isCritical);

  return { results, errors, hasCriticalError };
}
