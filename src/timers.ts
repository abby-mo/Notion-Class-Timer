import type { ResetPeriod, Timer } from "./types";

const STORAGE_KEY = "notion-quota-timers-v1";

export function loadTimers(): Timer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Timer[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTimers(timers: Timer[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
}

/** Start of local calendar day */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Start of local week (Monday) */
export function startOfWeek(date: Date): Date {
  const day = startOfDay(date);
  const weekday = day.getDay(); // 0 Sun … 6 Sat
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1;
  day.setDate(day.getDate() - daysFromMonday);
  return day;
}

/** Start of local calendar month */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function periodStartFor(period: ResetPeriod, now = new Date()): Date {
  switch (period) {
    case "day":
      return startOfDay(now);
    case "week":
      return startOfWeek(now);
    case "month":
      return startOfMonth(now);
  }
}

export function nextPeriodStart(period: ResetPeriod, from = new Date()): Date {
  const start = periodStartFor(period, from);
  switch (period) {
    case "day":
      start.setDate(start.getDate() + 1);
      return start;
    case "week":
      start.setDate(start.getDate() + 7);
      return start;
    case "month":
      return new Date(start.getFullYear(), start.getMonth() + 1, 1);
  }
}

/** If the stored period is stale, zero elapsed and bump periodStartedAt. */
export function applyPeriodReset(timer: Timer, now = new Date()): Timer {
  const currentStart = periodStartFor(timer.period, now).toISOString();
  if (timer.periodStartedAt === currentStart) return timer;

  return {
    ...timer,
    elapsedMs: 0,
    periodStartedAt: currentStart,
    runningSince: null,
  };
}

export function liveElapsedMs(timer: Timer, now = Date.now()): number {
  const runningExtra = timer.runningSince
    ? Math.max(0, now - new Date(timer.runningSince).getTime())
    : 0;
  return timer.elapsedMs + runningExtra;
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  }
  return `${seconds}s`;
}

export function formatTarget(ms: number): string {
  const totalMinutes = Math.round(ms / 60_000);
  if (totalMinutes >= 60 && totalMinutes % 60 === 0) {
    const hours = totalMinutes / 60;
    return `${hours}h`;
  }
  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  }
  return `${totalMinutes}m`;
}

export function periodLabel(period: ResetPeriod): string {
  switch (period) {
    case "day":
      return "daily";
    case "week":
      return "weekly";
    case "month":
      return "monthly";
  }
}

export function createId(): string {
  return crypto.randomUUID();
}
