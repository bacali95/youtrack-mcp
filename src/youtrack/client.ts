import type { YouTrackConfig } from "../config.ts";

/** Query parameter values accepted by the client; arrays are repeated as multiple params. */
export type QueryValue = string | number | boolean | undefined | null | (string | number)[];
export type Query = Record<string, QueryValue>;

export class YouTrackError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(YouTrackError.describe(status, body));
    this.name = "YouTrackError";
  }

  private static describe(status: number, body: unknown): string {
    if (body && typeof body === "object") {
      const record = body as Record<string, unknown>;
      const description = record.error_description ?? record.error;
      if (typeof description === "string") return `YouTrack API error ${status}: ${description}`;
    }
    if (typeof body === "string" && body.length > 0) return `YouTrack API error ${status}: ${body}`;
    return `YouTrack API error ${status}`;
  }
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Thin wrapper around the YouTrack REST API. Every MCP tool goes through this
 * single client so auth, URL/query building, and error handling live in one place.
 */
export class YouTrackClient {
  constructor(private readonly config: YouTrackConfig) {}

  private buildUrl(path: string, query?: Query): string {
    const url = new URL(`${this.config.baseUrl}${path}`);
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        for (const item of value) url.searchParams.append(key, String(item));
      } else {
        url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }

  async request<T = unknown>(
    method: "GET" | "POST" | "DELETE",
    path: string,
    options: { query?: Query; body?: unknown } = {},
  ): Promise<T> {
    const hasBody = options.body !== undefined;
    const response = await fetch(this.buildUrl(path, options.query), {
      method,
      headers: {
        Authorization: `Bearer ${this.config.token}`,
        Accept: "application/json",
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
      },
      body: hasBody ? JSON.stringify(options.body) : undefined,
    });

    const text = await response.text();
    const data = text.length > 0 ? safeJsonParse(text) : undefined;

    if (!response.ok) {
      throw new YouTrackError(response.status, data);
    }
    return data as T;
  }

  get<T = unknown>(path: string, query?: Query): Promise<T> {
    return this.request<T>("GET", path, { query });
  }

  post<T = unknown>(path: string, body?: unknown, query?: Query): Promise<T> {
    return this.request<T>("POST", path, { query, body });
  }

  delete<T = unknown>(path: string, query?: Query): Promise<T> {
    return this.request<T>("DELETE", path, { query });
  }
}
