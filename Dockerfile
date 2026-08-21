FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY src ./src
RUN bun build src/index.ts --target bun --outfile dist/index.js

FROM oven/bun:1-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/dist/index.js ./index.js

USER bun

# YOUTRACK_BASE_URL and YOUTRACK_TOKEN must be provided at `docker run` time.
# Defaults to stdio. Set MCP_TRANSPORT=http (plus MCP_HTTP_TOKEN) to run as a network
# service instead — see the README's "Hosting on a PaaS (Coolify, etc.)" section.
EXPOSE 3000
ENTRYPOINT ["bun", "run", "index.js"]
