/**
 * Cloudflare Worker proxy for Notion.
 *
 * Secrets / vars (set with wrangler):
 *   NOTION_TOKEN          Internal integration token
 *   NOTION_DATABASE_ID    To-do database ID
 *   NOTION_DONE_PROPERTY  Checkbox property name (default: "Done")
 *   NOTION_TITLE_PROPERTY Title property name (default: "Name")
 *   ALLOWED_ORIGIN        Your widget origin, e.g. https://abby-mo.github.io
 */

export interface Env {
  NOTION_TOKEN: string;
  NOTION_DATABASE_ID: string;
  NOTION_DONE_PROPERTY?: string;
  NOTION_TITLE_PROPERTY?: string;
  ALLOWED_ORIGIN?: string;
}

interface NotionRichText {
  plain_text: string;
}

interface NotionPage {
  id: string;
  properties: Record<string, {
    type: string;
    title?: NotionRichText[];
    rich_text?: NotionRichText[];
    checkbox?: boolean;
  }>;
}

function corsHeaders(env: Env, request: Request): HeadersInit {
  const origin = request.headers.get("Origin") ?? "";
  const allowed = env.ALLOWED_ORIGIN ?? "*";
  const allowOrigin = allowed === "*" || origin === allowed ? (allowed === "*" ? "*" : origin) : allowed;

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(data: unknown, init: ResponseInit & { env: Env; request: Request }): Response {
  const { env, request, ...rest } = init;
  return new Response(JSON.stringify(data), {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(env, request),
      ...(rest.headers ?? {}),
    },
  });
}

function text(body: string, init: ResponseInit & { env: Env; request: Request }): Response {
  const { env, request, ...rest } = init;
  return new Response(body, {
    ...rest,
    headers: {
      ...corsHeaders(env, request),
      ...(rest.headers ?? {}),
    },
  });
}

async function notionFetch(env: Env, path: string, init?: RequestInit): Promise<Response> {
  return fetch(`https://api.notion.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.NOTION_TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

function pageTitle(page: NotionPage, titleProp: string): string {
  const prop = page.properties[titleProp];
  if (!prop) return "Untitled";
  const bits = prop.title ?? prop.rich_text ?? [];
  const text = bits.map((b) => b.plain_text).join("").trim();
  return text || "Untitled";
}

async function listOpenTasks(env: Env): Promise<{ id: string; title: string }[]> {
  const doneProp = env.NOTION_DONE_PROPERTY ?? "Done";
  const titleProp = env.NOTION_TITLE_PROPERTY ?? "Name";

  const res = await notionFetch(env, `/databases/${env.NOTION_DATABASE_ID}/query`, {
    method: "POST",
    body: JSON.stringify({
      filter: {
        property: doneProp,
        checkbox: { equals: false },
      },
      sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
      page_size: 50,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Notion query failed: ${err}`);
  }

  const data = (await res.json()) as { results: NotionPage[] };
  return data.results.map((page) => ({
    id: page.id,
    title: pageTitle(page, titleProp),
  }));
}

async function markComplete(env: Env, pageId: string): Promise<void> {
  const doneProp = env.NOTION_DONE_PROPERTY ?? "Done";
  const res = await notionFetch(env, `/pages/${pageId}`, {
    method: "PATCH",
    body: JSON.stringify({
      properties: {
        [doneProp]: { checkbox: true },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Notion update failed: ${err}`);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return text("", { status: 204, env, request });
    }

    if (!env.NOTION_TOKEN || !env.NOTION_DATABASE_ID) {
      return text("Notion is not configured on the server.", { status: 500, env, request });
    }

    const url = new URL(request.url);

    try {
      if (request.method === "GET" && url.pathname === "/tasks") {
        const tasks = await listOpenTasks(env);
        return json({ tasks }, { env, request });
      }

      const completeMatch = url.pathname.match(/^\/tasks\/([^/]+)\/complete$/);
      if (request.method === "POST" && completeMatch) {
        const pageId = decodeURIComponent(completeMatch[1]);
        await markComplete(env, pageId);
        return json({ ok: true }, { env, request });
      }

      return text("Not found", { status: 404, env, request });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return text(message, { status: 502, env, request });
    }
  },
};
