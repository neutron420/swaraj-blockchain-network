<<<<<<< HEAD
FROM oven/bun:1 AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* bun.lock* ./

# Install dependencies
RUN bun install

# Copy source files
COPY . .

# Build the project using TypeScript compiler
RUN ./node_modules/.bin/tsc -p tsconfig.json
=======
# Build stage
FROM oven/bun:1 AS builder
WORKDIR /app

# Copy package file
COPY package.json ./

# Install all dependencies (needs dev deps for TypeScript build)
RUN bun install

# Copy source code and prebuilt artifacts
COPY . .

# Compile Solidity contracts (generates artifacts/) using fallback RPC
RUN bun run compile

# Build TypeScript worker (generates dist/)
RUN bun run build
>>>>>>> 201af549a41f42421c5bf324bd83ca059e5f4cb2

# Production stage
FROM oven/bun:1-slim
WORKDIR /app

<<<<<<< HEAD
# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/artifacts ./artifacts
COPY --from=builder /app/typechain-types ./typechain-types

# Copy package files and install production dependencies
COPY package.json package-lock.json* bun.lock* ./
RUN bun install --production

# Copy environment file (will be overridden by AWS ECS task definition)
COPY .env* ./

# Run the worker
CMD ["bun", "dist/src/worker.js"]
=======
# Copy built output and artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/artifacts ./artifacts
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lockb ./bun.lockb

# Install only production dependencies
RUN bun install --production

# Run the worker
CMD ["bun", "dist/worker.js"]
>>>>>>> 201af549a41f42421c5bf324bd83ca059e5f4cb2
