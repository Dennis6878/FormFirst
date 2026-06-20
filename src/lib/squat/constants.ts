// --- Landmark indices (MediaPipe Pose) ---
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

// --- Visibility ---
export const MIN_LANDMARK_VISIBILITY = 0.45;

// --- Calibration ---
export const CALIBRATION_FRAMES = 25;
export const CALIBRATION_STABILITY_THRESHOLD = 0.04;

// --- Depth thresholds ---
// Ratio = current hip-knee Y distance / standing hip-knee Y distance
// Drops below 1.0 as user squats (hips approach knees)
export const DEPTH_SUFFICIENT_RATIO = 0.65;
export const DEPTH_TOO_LOW_RATIO = 0.25;

// --- Rep counting (simple 2-state: UP / DOWN) ---
// Go below this ratio → entered "down" state
export const DOWN_THRESHOLD = 0.85;
// Go above this ratio → back to "up" state (rep counted)
export const UP_THRESHOLD = 0.93;
// Minimum time between reps
export const MIN_REP_INTERVAL_MS = 500;

// --- Knee valgus ---
export const VALGUS_RATIO_THRESHOLD = 0.7;

// --- Lateral trunk shift ---
export const TRUNK_SHIFT_THRESHOLD = 0.06;

// --- Stop recommendation ---
export const CONSECUTIVE_ERROR_REPS_FOR_STOP = 2;

// --- Skeleton connections for drawing ---
export const POSE_CONNECTIONS: [number, number][] = [
  [11, 12],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [24, 26],
  [25, 27],
  [26, 28],
];
