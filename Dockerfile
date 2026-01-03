# Build stage
FROM oven/bun:1 AS builder
WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install all dependencies (needs dev deps for TypeScript build)
RUN bun install

# Copy source code
COPY . .

# Compile Solidity contracts (generates artifacts/)
RUN bun run compile

# Build TypeScript worker (generates dist/)
RUN ./node_modules/.bin/tsc -p tsconfig.json

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
CMD ["bun", "dist/src/worker.js"]
