import type { NotionTask } from "./types";

const API_BASE = (import.meta.env.VITE_NOTION_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export function isNotionConfigured(): boolean {
  return Boolean(API_BASE);
}

export async function fetchNotionTasks(): Promise<NotionTask[]> {
  if (!API_BASE) return [];
  const res = await fetch(`${API_BASE}/tasks`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Failed to load Notion tasks (${res.status})`);
  }
  const data = (await res.json()) as { tasks: NotionTask[] };
  return data.tasks ?? [];
}

export async function completeNotionTask(pageId: string): Promise<void> {
  if (!API_BASE) return;
  const res = await fetch(`${API_BASE}/tasks/${encodeURIComponent(pageId)}/complete`, {
    method: "POST",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Failed to complete Notion task (${res.status})`);
  }
}
