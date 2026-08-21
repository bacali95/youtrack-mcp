FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY src ./src
RUN bun build src/index.ts --target bun --outfile dist/index.js

FROM oven/bun:1-slim
WORKDIR /app
COPY --from=build /app/dist/index.js ./index.js

USER bun

# YOUTRACK_BASE_URL and YOUTRACK_TOKEN must be provided at `docker run` time.
ENTRYPOINT ["bun", "run", "index.js"]
