import type { NotionTask, ResetPeriod, Timer, TimerInput } from "./types";
import {
  applyPeriodReset,
  createId,
  formatTarget,
  liveElapsedMs,
  loadTimers,
  nextPeriodStart,
  periodLabel,
  periodStartFor,
  saveTimers,
} from "./timers";
import { applyThemeColor, loadThemeColor, saveThemeColor } from "./theme";
import { playCompletionSound } from "./sound";
import { completeNotionTask, fetchNotionTasks, isNotionConfigured } from "./notion";
import "./style.css";

const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const app = document.querySelector<HTMLDivElement>("#app")!;

let timers: Timer[] = loadTimers().map((t) => applyPeriodReset(t));
saveTimers(timers);

let themeColor = loadThemeColor();
applyThemeColor(themeColor);

/** Timers that already chimed for the current period (`id:periodStartedAt`). */
const chimedKeys = new Set(
  timers.filter((t) => liveElapsedMs(t) >= t.targetMs).map(chimeKey),
);

let showForm = false;
let tickHandle: number | undefined;
let notionTasks: NotionTask[] = [];
let notionTasksStatus: "idle" | "loading" | "ready" | "error" = "idle";
let notionTasksError = "";
let completingId: string | null = null;

function chimeKey(timer: Timer): string {
  return `${timer.id}:${timer.periodStartedAt}`;
}

function persist(): void {
  saveTimers(timers);
}

function refreshPeriods(): boolean {
  let changed = false;
  timers = timers.map((t) => {
    const next = applyPeriodReset(t);
    if (next !== t) changed = true;
    return next;
  });
  if (changed) persist();
  return changed;
}

function createTimer(input: TimerInput): void {
  const now = new Date();
  const timer: Timer = {
    id: createId(),
    name: input.name.trim(),
    targetMs: input.targetMinutes * 60_000,
    period: input.period,
    elapsedMs: 0,
    periodStartedAt: periodStartFor(input.period, now).toISOString(),
    runningSince: null,
    createdAt: now.toISOString(),
    notionPageId: input.notionPageId,
  };
  timers = [timer, ...timers];
  persist();
  showForm = false;
  render();
}

function toggleRun(id: string): void {
  refreshPeriods();
  const now = new Date();
  timers = timers.map((t) => {
    if (t.id !== id) return t;
    if (t.runningSince) {
      const extra = Math.max(0, now.getTime() - new Date(t.runningSince).getTime());
      return {
        ...t,
        elapsedMs: t.elapsedMs + extra,
        runningSince: null,
      };
    }
    return { ...t, runningSince: now.toISOString() };
  });
  persist();
  render();
}

async function completeGoal(id: string): Promise<void> {
  const timer = timers.find((t) => t.id === id);
  if (!timer || completingId) return;

  completingId = id;
  render();

  try {
    if (timer.notionPageId) {
      await completeNotionTask(timer.notionPageId);
    }
    timers = timers.filter((t) => t.id !== id);
    persist();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update Notion";
    alert(`Couldn't mark the Notion task complete.\n\n${message}`);
  } finally {
    completingId = null;
    render();
  }
}

function resetElapsed(id: string): void {
  const timer = timers.find((t) => t.id === id);
  if (timer) chimedKeys.delete(chimeKey(timer));

  timers = timers.map((t) =>
    t.id === id ? { ...t, elapsedMs: 0, runningSince: null } : t,
  );
  persist();
  render();
}

async function loadNotionTasksForForm(): Promise<void> {
  if (!isNotionConfigured()) {
    notionTasks = [];
    notionTasksStatus = "idle";
    return;
  }

  notionTasksStatus = "loading";
  notionTasksError = "";
  render();

  try {
    notionTasks = await fetchNotionTasks();
    notionTasksStatus = "ready";
  } catch (error) {
    notionTasks = [];
    notionTasksStatus = "error";
    notionTasksError = error instanceof Error ? error.message : "Failed to load tasks";
  }
  render();
}

function maybeAnnounceCompletion(timer: Timer): void {
  const key = chimeKey(timer);
  const done = liveElapsedMs(timer) >= timer.targetMs;
  if (!done) {
    chimedKeys.delete(key);
    return;
  }
  if (chimedKeys.has(key)) return;
  chimedKeys.add(key);
  void playCompletionSound();
}

function pauseTimer(id: string): void {
  const now = new Date();
  timers = timers.map((t) => {
    if (t.id !== id || !t.runningSince) return t;
    const extra = Math.max(0, now.getTime() - new Date(t.runningSince).getTime());
    return {
      ...t,
      elapsedMs: t.elapsedMs + extra,
      runningSince: null,
    };
  });
  persist();
}

function updateLiveDisplays(): void {
  if (refreshPeriods()) {
    render();
    return;
  }

  let needsFullRender = false;

  for (const timer of timers) {
    if (!timer.runningSince) continue;
    const card = app.querySelector<HTMLElement>(`.timer-card[data-id="${timer.id}"]`);
    if (!card) continue;

    const elapsed = liveElapsedMs(timer);
    const pct = progressPct(timer);
    const done = elapsed >= timer.targetMs;

    card.classList.toggle("is-done", done);
    const ring = card.querySelector<SVGCircleElement>(".ring-progress");
    const clock = card.querySelector<HTMLElement>(".clock");
    if (ring) ring.style.strokeDashoffset = String(ringOffset(pct));
    if (clock) clock.textContent = formatClock(elapsed);

    if (done) {
      maybeAnnounceCompletion(timer);
      pauseTimer(timer.id);
      needsFullRender = true;
    }
  }

  if (needsFullRender) {
    render();
  }
}

function ensureTicking(): void {
  const anyRunning = timers.some((t) => t.runningSince);
  if (anyRunning && tickHandle === undefined) {
    tickHandle = window.setInterval(() => updateLiveDisplays(), 1000);
  }
  if (!anyRunning && tickHandle !== undefined) {
    clearInterval(tickHandle);
    tickHandle = undefined;
  }
}

function progressPct(timer: Timer): number {
  if (timer.targetMs <= 0) return 0;
  return Math.min(100, (liveElapsedMs(timer) / timer.targetMs) * 100);
}

function ringOffset(pct: number): number {
  return RING_CIRCUMFERENCE * (1 - pct / 100);
}

function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function resetsInLabel(timer: Timer): string {
  const next = nextPeriodStart(timer.period);
  const ms = next.getTime() - Date.now();
  if (ms < 60_000) return "resets soon";
  if (ms < 3_600_000) return `resets in ${Math.ceil(ms / 60_000)}m`;
  if (ms < 86_400_000) return `resets in ${Math.ceil(ms / 3_600_000)}h`;
  return `resets in ${Math.ceil(ms / 86_400_000)}d`;
}

function renderNotionTaskField(): string {
  if (!isNotionConfigured()) {
    return `
      <p class="form-note">
        Notion linking is optional. Add <code>VITE_NOTION_API_URL</code> after deploying the worker to connect your to-do database.
      </p>
    `;
  }

  if (notionTasksStatus === "loading") {
    return `<p class="form-note">Loading Notion tasks…</p>`;
  }

  if (notionTasksStatus === "error") {
    return `<p class="form-note error">${escapeHtml(notionTasksError)}</p>`;
  }

  const options = notionTasks
    .map((task) => `<option value="${escapeHtml(task.id)}">${escapeHtml(task.title)}</option>`)
    .join("");

  return `
    <label>
      <span>Notion to-do</span>
      <select name="notionPageId" id="notion-task-select">
        <option value="">None</option>
        ${options}
      </select>
    </label>
  `;
}

function renderForm(): string {
  return `
    <form class="create-form" id="create-form">
      ${renderNotionTaskField()}
      <label>
        <span>Name</span>
        <input name="name" id="timer-name" type="text" placeholder="Meditation" required maxlength="40" autocomplete="off" />
      </label>
      <div class="row">
        <label>
          <span>Target</span>
          <div class="target-input">
            <input name="amount" type="number" min="1" step="1" value="30" required />
            <select name="unit" aria-label="Unit">
              <option value="minutes">minutes</option>
              <option value="hours">hours</option>
            </select>
          </div>
        </label>
        <label>
          <span>Resets</span>
          <select name="period">
            <option value="day">Every day</option>
            <option value="week" selected>Every week</option>
            <option value="month">Every month</option>
          </select>
        </label>
      </div>
      <div class="form-actions">
        <button type="button" class="btn ghost" id="cancel-create">Cancel</button>
        <button type="submit" class="btn primary">Add timer</button>
      </div>
    </form>
  `;
}

function renderTimerCard(timer: Timer): string {
  const elapsed = liveElapsedMs(timer);
  const pct = progressPct(timer);
  const done = elapsed >= timer.targetMs;
  const running = Boolean(timer.runningSince);
  const offset = ringOffset(pct);
  const isCompleting = completingId === timer.id;

  return `
    <article class="timer-card ${running ? "is-running" : ""} ${done ? "is-done" : ""}" data-id="${timer.id}">
      <div class="card-top">
        <h2>${escapeHtml(timer.name)}</h2>
        <p class="meta">
          ${formatTarget(timer.targetMs)} ${periodLabel(timer.period)}
          ${timer.notionPageId ? ` · <span class="notion-tag">Notion</span>` : ""}
        </p>
      </div>

      <button class="ring-btn" data-action="toggle" title="${running ? "Pause" : "Start"}" aria-label="${running ? "Pause" : "Start"} ${escapeHtml(timer.name)}">
        <svg class="ring" viewBox="0 0 120 120" aria-hidden="true">
          <circle class="ring-track" cx="60" cy="60" r="${RING_RADIUS}" />
          <circle
            class="ring-progress"
            cx="60"
            cy="60"
            r="${RING_RADIUS}"
            style="stroke-dasharray: ${RING_CIRCUMFERENCE}; stroke-dashoffset: ${offset}"
          />
        </svg>
        <span class="clock">${formatClock(elapsed)}</span>
      </button>

      <p class="reset-hint">${resetsInLabel(timer)}</p>

      <div class="card-actions">
        <button class="btn reset" data-action="reset">Reset</button>
        <button class="btn complete" data-action="complete" ${isCompleting ? "disabled" : ""}>
          ${isCompleting ? "Updating Notion…" : "Complete goal"}
        </button>
      </div>
    </article>
  `;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function render(): void {
  refreshPeriods();
  ensureTicking();
  applyThemeColor(themeColor);

  app.innerHTML = `
    <main class="shell">
      <header class="toolbar">
        <label class="theme-picker" title="Theme color">
          <span class="theme-swatch" style="background: ${themeColor}"></span>
          <input id="theme-color" type="color" value="${themeColor}" aria-label="Theme color" />
        </label>
      </header>

      ${showForm ? renderForm() : ""}

      <section class="board" aria-live="polite">
        ${
          timers.length === 0 && !showForm
            ? `<p class="empty">Add a timer for a daily or weekly quota.</p>`
            : timers.map(renderTimerCard).join("")
        }
        ${
          showForm
            ? ""
            : `<button class="add-btn" id="open-create" title="New timer" aria-label="New timer">+</button>`
        }
      </section>
    </main>
  `;

  bindEvents();
}

function bindEvents(): void {
  const themeInput = document.querySelector<HTMLInputElement>("#theme-color");
  themeInput?.addEventListener("input", () => {
    themeColor = themeInput.value;
    applyThemeColor(themeColor);
    const swatch = document.querySelector<HTMLElement>(".theme-swatch");
    if (swatch) swatch.style.background = themeColor;
  });
  themeInput?.addEventListener("change", () => {
    themeColor = themeInput.value;
    saveThemeColor(themeColor);
    applyThemeColor(themeColor);
  });

  document.querySelector("#open-create")?.addEventListener("click", () => {
    showForm = true;
    void loadNotionTasksForForm();
    render();
  });

  document.querySelector("#cancel-create")?.addEventListener("click", () => {
    showForm = false;
    render();
  });

  const notionSelect = document.querySelector<HTMLSelectElement>("#notion-task-select");
  const nameInput = document.querySelector<HTMLInputElement>("#timer-name");
  notionSelect?.addEventListener("change", () => {
    const task = notionTasks.find((t) => t.id === notionSelect.value);
    if (task && nameInput && !nameInput.value.trim()) {
      nameInput.value = task.title.slice(0, 40);
    }
  });

  const form = document.querySelector<HTMLFormElement>("#create-form");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") ?? "");
    const amount = Number(data.get("amount"));
    const unit = String(data.get("unit"));
    const period = String(data.get("period")) as ResetPeriod;
    const notionPageId = String(data.get("notionPageId") ?? "").trim() || undefined;
    if (!name || !Number.isFinite(amount) || amount <= 0) return;

    const targetMinutes = unit === "hours" ? amount * 60 : amount;
    createTimer({ name, targetMinutes, period, notionPageId });
  });

  app.querySelectorAll<HTMLElement>(".timer-card").forEach((card) => {
    const id = card.dataset.id!;
    card.querySelector('[data-action="toggle"]')?.addEventListener("click", () => toggleRun(id));
    card.querySelector('[data-action="reset"]')?.addEventListener("click", () => resetElapsed(id));
    card.querySelector('[data-action="complete"]')?.addEventListener("click", () => {
      void completeGoal(id);
    });
  });
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    refreshPeriods();
    render();
  }
});

render();
