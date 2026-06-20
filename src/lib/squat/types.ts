export interface RepLog {
  repNumber: number;
  errors: string[];
  timestamp: number;
}

export interface SessionSummary {
  exercise: string;
  totalReps: number;
  repLogs: RepLog[];
  mostCommonMistake: string | null;
  date: number;
}

export interface CalibrationData {
  standingHipY: number;
  standingKneeY: number;
  standingHipKneeDelta: number;
  standingKneeDistance: number;
  standingAnkleDistance: number;
  standingShoulderMidX: number;
  standingHipMidX: number;
}

export enum SquatPhase {
  STANDING = "STANDING",
  DESCENDING = "DESCENDING",
  BOTTOM = "BOTTOM",
  ASCENDING = "ASCENDING",
}

export enum AnalysisStage {
  WAITING = "WAITING",
  CALIBRATING = "CALIBRATING",
  ACTIVE = "ACTIVE",
  STOPPED = "STOPPED",
}
