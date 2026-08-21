FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM oven/bun:1
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lock tsconfig.json ./
COPY src ./src

USER bun

# YOUTRACK_BASE_URL and YOUTRACK_TOKEN must be provided at `docker run` time.
ENTRYPOINT ["bun", "run", "src/index.ts"]
