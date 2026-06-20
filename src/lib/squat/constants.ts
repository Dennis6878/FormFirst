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

// --- Calibration ---
export const CALIBRATION_FRAMES = 30;
export const CALIBRATION_STABILITY_THRESHOLD = 0.015;

// --- Depth thresholds ---
// Ratio of current hip-knee delta to standing hip-knee delta
// Lower = deeper squat
export const DEPTH_SUFFICIENT_RATIO = 0.55;
export const DEPTH_TOO_LOW_RATIO = 0.25;

// --- Rep counting hysteresis ---
// Ratio thresholds for state transitions (relative to standing delta)
export const DESCENT_THRESHOLD_RATIO = 0.75;
export const ASCENT_THRESHOLD_RATIO = 0.85;
export const MIN_MOVEMENT_THRESHOLD = 0.1;

// --- Knee valgus ---
// Ratio: knee-to-knee distance / ankle-to-ankle distance
// Below this = knees caving in
export const VALGUS_RATIO_THRESHOLD = 0.7;

// --- Lateral trunk shift ---
// Max allowed horizontal offset between shoulder midpoint and hip midpoint
// Normalized coordinates (0-1)
export const TRUNK_SHIFT_THRESHOLD = 0.04;

// --- Stop recommendation ---
export const CONSECUTIVE_ERROR_REPS_FOR_STOP = 2;

// --- Skeleton connections for drawing ---
export const POSE_CONNECTIONS: [number, number][] = [
  [11, 12], // shoulders
  [11, 23], // left shoulder to hip
  [12, 24], // right shoulder to hip
  [23, 24], // hips
  [23, 25], // left hip to knee
  [24, 26], // right hip to knee
  [25, 27], // left knee to ankle
  [26, 28], // right knee to ankle
];
