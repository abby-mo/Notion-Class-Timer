export type ResetPeriod = "day" | "week" | "month";

export interface Timer {
  id: string;
  name: string;
  /** Target quota in milliseconds */
  targetMs: number;
  period: ResetPeriod;
  /** Elapsed time toward the current period quota */
  elapsedMs: number;
  /** ISO timestamp of when the current period started */
  periodStartedAt: string;
  /** If running, wall-clock time when the current run started */
  runningSince: string | null;
  createdAt: string;
  /** Linked Notion to-do page, if any */
  notionPageId?: string;
}

export interface TimerInput {
  name: string;
  targetMinutes: number;
  period: ResetPeriod;
  notionPageId?: string;
}

export interface NotionTask {
  id: string;
  title: string;
}
