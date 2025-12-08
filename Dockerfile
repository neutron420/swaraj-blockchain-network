FROM oven/bun:1 AS builder
WORKDIR /app
COPY bun.lockb package.json ./
RUN bun install
COPY . .
RUN bun run build

FROM oven/bun:1-slim
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package.json bun.lockb .env ./
RUN bun install --production
CMD ["bun", "dist/worker.js"]
