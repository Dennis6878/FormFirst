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
  standingHipKneeDelta: number;
  standingShoulderMidX: number;
  standingHipMidX: number;
}

export enum AnalysisStage {
  WAITING = "WAITING",
  CALIBRATING = "CALIBRATING",
  ACTIVE = "ACTIVE",
}
