export interface YouTrackConfig {
  /** Base URL of the YouTrack REST API, e.g. https://example.youtrack.cloud/api */
  baseUrl: string;
  /** Permanent token used for Bearer authentication. */
  token: string;
}

function required(name: string, hint?: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name}.${hint ? ` ${hint}` : ""}`);
  }
  return value;
}

export function loadConfig(): YouTrackConfig {
  const baseUrl = required("YOUTRACK_BASE_URL", "e.g. https://<your-instance>/api").replace(/\/+$/, "");
  const token = required("YOUTRACK_TOKEN", "a YouTrack permanent token");
  return { baseUrl, token };
}

export type TransportConfig = { kind: "stdio" } | { kind: "http"; port: number; authToken: string };

/**
 * Defaults to stdio (the normal case: an MCP client spawns this process directly).
 * Set MCP_TRANSPORT=http to run as a standalone network service instead, e.g. behind
 * a PaaS like Coolify — see the README for details.
 */
export function loadTransportConfig(): TransportConfig {
  const kind = (process.env.MCP_TRANSPORT ?? "stdio").toLowerCase();
  if (kind === "stdio") return { kind: "stdio" };
  if (kind === "http") {
    const port = Number(process.env.PORT ?? 3000);
    const authToken = required(
      "MCP_HTTP_TOKEN",
      "a secret bearer token clients must present, since this endpoint would otherwise be reachable by anyone who finds the URL",
    );
    return { kind: "http", port, authToken };
  }
  throw new Error(`Unknown MCP_TRANSPORT "${kind}". Use "stdio" (default) or "http".`);
}
