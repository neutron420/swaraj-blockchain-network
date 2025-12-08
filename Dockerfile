# Build stage
FROM oven/bun:1 AS builder
WORKDIR /app

# Copy package files
COPY package.json ./

# Install all dependencies (including devDependencies for compilation)
RUN bun install

# Copy source code and config files
COPY . .

# Compile Solidity contracts (generates artifacts/)
RUN bun run compile

# Build TypeScript worker (generates dist/)
RUN bun run build

# Production stage
FROM oven/bun:1-slim
WORKDIR /app

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/artifacts ./artifacts
COPY --from=builder /app/package.json ./

# Install only production dependencies
RUN bun install --production

# Run the worker
CMD ["bun", "dist/worker.js"]
