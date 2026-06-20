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
export const MIN_LANDMARK_VISIBILITY = 0.6;

// --- Calibration ---
export const CALIBRATION_FRAMES = 45;
export const CALIBRATION_STABILITY_THRESHOLD = 0.03;

// --- Smoothing ---
// Exponential moving average alpha (0-1, lower = more smoothing)
export const SMOOTHING_ALPHA = 0.3;

// --- Depth thresholds ---
// Ratio of current hip-knee delta to standing hip-knee delta
// Lower = deeper squat
export const DEPTH_SUFFICIENT_RATIO = 0.55;
export const DEPTH_TOO_LOW_RATIO = 0.25;

// --- Rep counting hysteresis ---
// Wide gap between descent and ascent thresholds prevents noise-triggered transitions
export const DESCENT_THRESHOLD_RATIO = 0.65;
export const ASCENT_THRESHOLD_RATIO = 0.90;
// Minimum depth the user must reach (relative to standing) to count as a rep
export const MIN_MOVEMENT_THRESHOLD = 0.25;
// Minimum time (ms) between reps to prevent double-counting
export const MIN_REP_INTERVAL_MS = 800;

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
