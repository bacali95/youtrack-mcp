# youtrack-mcp

An [MCP](https://modelcontextprotocol.io) server for [YouTrack](https://www.jetbrains.com/youtrack/), built with
TypeScript and [Bun](https://bun.sh). It works against any YouTrack instance (Cloud or self-hosted) — you supply
the base URL and an API token, nothing is hardcoded.

## Setup

You need a YouTrack **permanent token**: in YouTrack, go to your profile → *Account Security* → *New token...*.

Set two environment variables:

- `YOUTRACK_BASE_URL` — the REST API base URL of your instance, e.g. `https://mycompany.youtrack.cloud/api` or
  `https://youtrack.mycompany.com/api` for self-hosted installs.
- `YOUTRACK_TOKEN` — the permanent token.

Install dependencies with Bun:

```sh
bun install
```

### Run directly

```sh
YOUTRACK_BASE_URL=https://mycompany.youtrack.cloud/api YOUTRACK_TOKEN=perm:xxxx bun run src/index.ts
```

### Configure in an MCP client

The server speaks MCP over stdio, so any client that can spawn a command works. It can be pointed at the source
directly with `bun`, or at the [prebuilt Docker image](#docker-image) — either way you just need
`YOUTRACK_BASE_URL` and `YOUTRACK_TOKEN` in its environment.

#### Claude Code / Claude Desktop

Add to `mcp.json` (Claude Code: `claude mcp add`, or edit the file directly; Claude Desktop: Settings → Developer):

```json
{
  "mcpServers": {
    "youtrack": {
      "command": "bun",
      "args": ["run", "/path/to/youtrack-mcp/src/index.ts"],
      "env": {
        "YOUTRACK_BASE_URL": "https://mycompany.youtrack.cloud/api",
        "YOUTRACK_TOKEN": "perm:xxxx"
      }
    }
  }
}
```

#### VS Code

VS Code (via GitHub Copilot Chat's agent mode) reads MCP server definitions from a workspace's `.vscode/mcp.json`
(or your user settings — run **MCP: Add Server** from the command palette to create either). It supports
prompting for secrets instead of hardcoding them, using `${input:...}`:

```json
{
  "servers": {
    "youtrack": {
      "type": "stdio",
      "command": "bun",
      "args": ["run", "/path/to/youtrack-mcp/src/index.ts"],
      "env": {
        "YOUTRACK_BASE_URL": "https://mycompany.youtrack.cloud/api",
        "YOUTRACK_TOKEN": "${input:youtrack-token}"
      }
    }
  },
  "inputs": [
    {
      "id": "youtrack-token",
      "type": "promptString",
      "description": "YouTrack permanent token",
      "password": true
    }
  ]
}
```

You'll be prompted for the token the first time the server starts, and it's stored securely rather than committed
to the workspace file. Once added, enable it for a chat by opening the tools picker (🔧) in Copilot Chat's agent
mode.

#### Using the Docker image instead of `bun`

Any of the configs above also work by swapping the `command`/`args` for Docker, so the client doesn't need Bun or
this repo checked out locally — just Docker and the environment variables:

```json
{
  "command": "docker",
  "args": [
    "run", "--rm", "-i",
    "-e", "YOUTRACK_BASE_URL", "-e", "YOUTRACK_TOKEN",
    "ghcr.io/bacali95/youtrack-mcp:latest"
  ],
  "env": {
    "YOUTRACK_BASE_URL": "https://mycompany.youtrack.cloud/api",
    "YOUTRACK_TOKEN": "perm:xxxx"
  }
}
```

`-i` keeps stdin open (required for MCP's stdio transport) and `--rm` cleans up the container once the client
disconnects. `-e YOUTRACK_BASE_URL` (without a `=value`) tells Docker to forward that variable from the `env`
block above rather than duplicating it inline.

## Docker image

Every push to `main` publishes an image to GitHub Container Registry (see
[`.github/workflows/docker-build.yml`](.github/workflows/docker-build.yml)):

```sh
docker pull ghcr.io/bacali95/youtrack-mcp:latest
docker run --rm -i \
  -e YOUTRACK_BASE_URL=https://mycompany.youtrack.cloud/api \
  -e YOUTRACK_TOKEN=perm:xxxx \
  ghcr.io/bacali95/youtrack-mcp:latest
```

You can also build it locally with `docker build -t youtrack-mcp .`.

### Deploying to a VPS

This server talks MCP over stdio, not HTTP — there's no port to expose, and nothing needs to run continuously.
An MCP client always works by spawning the server process itself and talking to it over that process's
stdin/stdout, so "deploying" it means making sure the client *can* spawn it, wherever that client runs:

- **Running the MCP client itself on the VPS** (e.g. a headless Claude Code / Claude Code on the web session, or
  any agent you SSH into and drive interactively): just pull the image there and use the Docker config from above
  in that environment's `mcp.json` — no different from a local setup.
- **Running the MCP client on your laptop, with the server on the VPS**: have the client spawn the process over
  SSH instead of locally, so Docker only needs to exist on the VPS:

  ```json
  {
    "command": "ssh",
    "args": [
      "user@your-vps",
      "docker", "run", "--rm", "-i",
      "-e", "YOUTRACK_BASE_URL=https://mycompany.youtrack.cloud/api",
      "-e", "YOUTRACK_TOKEN=perm:xxxx",
      "ghcr.io/bacali95/youtrack-mcp:latest"
    ]
  }
  ```

  Set up an SSH key (no passphrase prompt) for that host so the client can spawn it non-interactively. Since the
  token is passed as a literal argument here, restrict that SSH key/user as tightly as you can (e.g. a
  dedicated user that can only run this one `docker run` command via a forced command in `authorized_keys`).

## Tools

Tools are grouped by resource and share a `fields` argument (YouTrack's partial-response syntax) with a sensible
default, so you only need to specify it when you want more or less data back.

- **Issues** — `list_issues` (search), `get_issue`, `create_issue`, `update_issue`, `delete_issue`,
  `execute_command` (apply any YouTrack command — state, assignee, priority, links, tags, sprint, etc. via its
  natural query syntax, e.g. `"State Fixed assignee John.Doe"`)
- **Comments** — `list_issue_comments`, `add_issue_comment`, `update_issue_comment`, `delete_issue_comment`
- **Links** — `list_issue_links`, `list_issue_link_types`
- **Tags** — `list_tags`, `create_tag`, `list_issue_tags`, `add_issue_tag`, `remove_issue_tag`
- **Time tracking** — `list_issue_work_items`, `add_issue_work_item`, `update_issue_work_item`,
  `delete_issue_work_item`, `list_work_items`
- **Projects** — `list_projects`, `get_project`, `create_project`, `update_project`, `list_project_custom_fields`
- **Users & groups** — `get_current_user`, `list_users`, `get_user`, `list_groups`
- **Knowledge base** — `list_articles`, `get_article`, `create_article`, `update_article`, `delete_article`
- **Agile boards** — `list_agile_boards`, `get_agile_board`, `list_sprints`, `get_sprint`
- **Saved searches** — `list_saved_queries`
- **Escape hatch** — `youtrack_raw_request` calls any endpoint of the
  [YouTrack REST API](https://www.jetbrains.com/help/youtrack/devportal/youtrack-rest-api.html) directly (method,
  path, query, body), for the long tail of admin/settings endpoints not covered by a dedicated tool.

## Design

- `src/youtrack/client.ts` — the only place that talks HTTP: auth header, URL/query building, JSON + error
  handling. Every tool goes through it.
- `src/youtrack/fields.ts` — default `fields` presets per entity, taken from YouTrack's own OpenAPI defaults.
- `src/youtrack/params.ts` — shared Zod schema fragments (`fields`, pagination, IDs) reused across tools.
- `src/tool.ts` — `defineTool` + `registerTools`, so each tool file only declares a name/description/schema/handler
  and the MCP response/error wrapping happens in one place.
- `src/youtrack/tools/*.ts` — one file per resource, each tool a few lines built on the shared pieces above.

## Development

```sh
bun run typecheck   # tsc --noEmit
bun run dev         # run with --watch
```
