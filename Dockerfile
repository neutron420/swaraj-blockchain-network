FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json ./
RUN bun install
COPY . .
RUN bun run compile
RUN bun run build

FROM oven/bun:1-slim
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/artifacts ./artifacts
COPY package.json ./
RUN bun install --production
CMD ["bun", "dist/worker.js"]
