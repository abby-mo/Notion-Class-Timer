import type { ResetPeriod, Timer, TimerInput } from "./types";
import {
  applyPeriodReset,
  createId,
  formatDuration,
  formatTarget,
  liveElapsedMs,
  loadTimers,
  nextPeriodStart,
  periodLabel,
  periodStartFor,
  saveTimers,
} from "./timers";
import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app")!;

let timers: Timer[] = loadTimers().map((t) => applyPeriodReset(t));
saveTimers(timers);

let showForm = false;
let tickHandle: number | undefined;

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

function addManualMinutes(id: string, minutes: number): void {
  refreshPeriods();
  timers = timers.map((t) =>
    t.id === id ? { ...t, elapsedMs: Math.max(0, t.elapsedMs + minutes * 60_000) } : t,
  );
  persist();
  render();
}

function resetElapsed(id: string): void {
  timers = timers.map((t) =>
    t.id === id ? { ...t, elapsedMs: 0, runningSince: null } : t,
  );
  persist();
  render();
}

function deleteTimer(id: string): void {
  timers = timers.filter((t) => t.id !== id);
  persist();
  render();
}

function updateLiveDisplays(): void {
  if (refreshPeriods()) {
    render();
    return;
  }

  for (const timer of timers) {
    if (!timer.runningSince) continue;
    const card = app.querySelector<HTMLElement>(`.timer-card[data-id="${timer.id}"]`);
    if (!card) continue;

    const elapsed = liveElapsedMs(timer);
    const pct = progressPct(timer);
    const done = elapsed >= timer.targetMs;

    card.classList.toggle("is-done", done);
    const fill = card.querySelector<HTMLElement>(".progress-fill");
    const track = card.querySelector<HTMLElement>(".progress-track");
    const elapsedEl = card.querySelector<HTMLElement>(".elapsed");
    if (fill) fill.style.width = `${pct}%`;
    if (track) track.setAttribute("aria-valuenow", String(Math.round(pct)));
    if (elapsedEl) elapsedEl.textContent = formatDuration(elapsed);
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

function resetsInLabel(timer: Timer): string {
  const next = nextPeriodStart(timer.period);
  const ms = next.getTime() - Date.now();
  if (ms < 60_000) return "resets soon";
  if (ms < 3_600_000) return `resets in ${Math.ceil(ms / 60_000)}m`;
  if (ms < 86_400_000) return `resets in ${Math.ceil(ms / 3_600_000)}h`;
  return `resets in ${Math.ceil(ms / 86_400_000)}d`;
}

function renderForm(): string {
  return `
    <form class="create-form" id="create-form">
      <label>
        <span>Name</span>
        <input name="name" type="text" placeholder="Meditation" required maxlength="40" autocomplete="off" />
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

  return `
    <article class="timer-card ${running ? "is-running" : ""} ${done ? "is-done" : ""}" data-id="${timer.id}">
      <header class="timer-head">
        <div>
          <h2>${escapeHtml(timer.name)}</h2>
          <p class="meta">${formatTarget(timer.targetMs)} ${periodLabel(timer.period)} · ${resetsInLabel(timer)}</p>
        </div>
        <button class="icon-btn" data-action="delete" title="Delete" aria-label="Delete ${escapeHtml(timer.name)}">×</button>
      </header>

      <div class="progress-block">
        <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pct)}">
          <div class="progress-fill" style="width: ${pct}%"></div>
        </div>
        <div class="progress-numbers">
          <span class="elapsed">${formatDuration(elapsed)}</span>
          <span class="of">/ ${formatTarget(timer.targetMs)}</span>
        </div>
      </div>

      <div class="timer-actions">
        <button class="btn primary" data-action="toggle">
          ${running ? "Pause" : done ? "Log more" : "Start"}
        </button>
        <button class="btn ghost" data-action="add5" title="Add 5 minutes">+5m</button>
        <button class="btn ghost" data-action="reset" title="Reset this period">Reset</button>
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

  app.innerHTML = `
    <main class="shell">
      <header class="top">
        <div>
          <p class="eyebrow">Quota timers</p>
          <h1>Time budgets</h1>
        </div>
        ${
          showForm
            ? ""
            : `<button class="btn primary" id="open-create">New</button>`
        }
      </header>

      ${showForm ? renderForm() : ""}

      <section class="list" aria-live="polite">
        ${
          timers.length === 0 && !showForm
            ? `<p class="empty">Add a timer for something you want on a schedule — like 30 minutes of meditation a day, or 3 hours of reading a week.</p>`
            : timers.map(renderTimerCard).join("")
        }
      </section>
    </main>
  `;

  bindEvents();
}

function bindEvents(): void {
  document.querySelector("#open-create")?.addEventListener("click", () => {
    showForm = true;
    render();
  });

  document.querySelector("#cancel-create")?.addEventListener("click", () => {
    showForm = false;
    render();
  });

  const form = document.querySelector<HTMLFormElement>("#create-form");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") ?? "");
    const amount = Number(data.get("amount"));
    const unit = String(data.get("unit"));
    const period = String(data.get("period")) as ResetPeriod;
    if (!name || !Number.isFinite(amount) || amount <= 0) return;

    const targetMinutes = unit === "hours" ? amount * 60 : amount;
    createTimer({ name, targetMinutes, period });
  });

  app.querySelectorAll<HTMLElement>(".timer-card").forEach((card) => {
    const id = card.dataset.id!;
    card.querySelector('[data-action="toggle"]')?.addEventListener("click", () => toggleRun(id));
    card.querySelector('[data-action="add5"]')?.addEventListener("click", () => addManualMinutes(id, 5));
    card.querySelector('[data-action="reset"]')?.addEventListener("click", () => resetElapsed(id));
    card.querySelector('[data-action="delete"]')?.addEventListener("click", () => {
      if (confirm("Delete this timer?")) deleteTimer(id);
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
