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
export const MIN_LANDMARK_VISIBILITY = 0.5;

// --- Calibration ---
export const CALIBRATION_FRAMES = 30;
export const CALIBRATION_STABILITY_THRESHOLD = 0.035;

// --- Smoothing ---
export const SMOOTHING_ALPHA = 0.4;

// --- Depth thresholds ---
export const DEPTH_SUFFICIENT_RATIO = 0.6;
export const DEPTH_TOO_LOW_RATIO = 0.2;

// --- Rep counting hysteresis ---
export const DESCENT_THRESHOLD_RATIO = 0.80;
export const ASCENT_THRESHOLD_RATIO = 0.92;
export const BOTTOM_THRESHOLD_RATIO = 0.65;
export const MIN_MOVEMENT_THRESHOLD = 0.15;
export const MIN_REP_INTERVAL_MS = 600;

// --- Knee valgus ---
export const VALGUS_RATIO_THRESHOLD = 0.7;

// --- Lateral trunk shift ---
export const TRUNK_SHIFT_THRESHOLD = 0.04;

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
