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

# Production stage
FROM oven/bun:1-slim
WORKDIR /app

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
