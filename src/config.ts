export interface YouTrackConfig {
  /** Base URL of the YouTrack REST API, e.g. https://example.youtrack.cloud/api */
  baseUrl: string;
  /** Permanent token used for Bearer authentication. */
  token: string;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. ` +
        "Set YOUTRACK_BASE_URL (e.g. https://<your-instance>/api) and YOUTRACK_TOKEN (a YouTrack permanent token).",
    );
  }
  return value;
}

export function loadConfig(): YouTrackConfig {
  const baseUrl = required("YOUTRACK_BASE_URL").replace(/\/+$/, "");
  const token = required("YOUTRACK_TOKEN");
  return { baseUrl, token };
}
