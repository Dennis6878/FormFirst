export const LANDMARKS = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
} as const;

export const MIN_VISIBILITY = 0.45;

export const CALIBRATION_FRAMES = 25;
export const CALIBRATION_STABILITY = 0.04;

// Depth ratio = current hip-knee distance / standing hip-knee distance
// ~1.0 standing, drops toward 0 as you squat deeper
export const DEPTH_GOOD_MIN = 0.30;
export const DEPTH_GOOD_MAX = 0.65;

// Rep counting
export const DOWN_THRESHOLD = 0.85;
export const UP_THRESHOLD = 0.90;
export const MIN_REP_INTERVAL_MS = 500;

// Balance: shoulder-hip horizontal offset
export const BALANCE_THRESHOLD = 0.035;

export const CONSECUTIVE_BALANCE_FOR_STOP = 2;

export const POSE_CONNECTIONS: [number, number][] = [
  [11, 12], [11, 23], [12, 24], [23, 24],
  [23, 25], [24, 26], [25, 27], [26, 28],
];
