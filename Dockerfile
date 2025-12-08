# Build stage
FROM oven/bun:1 AS builder
WORKDIR /app

# Copy package file
COPY package.json ./

# Install all dependencies (needs dev deps for TypeScript build)
RUN bun install

# Copy source code and prebuilt artifacts
COPY . .

# Build TypeScript worker (generates dist/). Artifacts are already present in repo.
RUN bun run build

# Production stage
FROM oven/bun:1-slim
WORKDIR /app

# Copy built output and artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/artifacts ./artifacts
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lockb ./bun.lockb

# Install only production dependencies
RUN bun install --production

# Run the worker
CMD ["bun", "dist/worker.js"]
