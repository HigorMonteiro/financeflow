# Multi-stage build for production
FROM node:20-alpine AS base

# Install pnpm and OpenSSL (required for Prisma)
RUN apk add --no-cache openssl openssl-dev && \
    npm install -g pnpm

# Dependencies stage
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# Build stage
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Copy source code and Prisma schema
COPY . .

# Setup Prisma schema based on DATABASE_URL
# Always uses PostgreSQL
ARG DATABASE_URL=postgresql://financeflow:changeme@postgres:5432/financeflow
ENV DATABASE_URL=$DATABASE_URL
RUN node scripts/setup-prisma-schema.js

# Generate Prisma Client
# Prisma needs a valid DATABASE_URL format to validate schema during build
# The real DATABASE_URL will be provided at runtime via environment variables
# Force Prisma to use OpenSSL 3.x binary for Alpine Linux
RUN PRISMA_CLI_BINARY_TARGETS=linux-musl-openssl-3.0.x pnpm prisma generate || \
    pnpm prisma generate

# Build TypeScript
RUN ls -la tsconfig.json && pnpm exec tsc -p tsconfig.json

# Fix imports to add .js extensions (required for ES modules)
RUN node scripts/fix-imports.js || echo "Warning: Could not fix imports"

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Ensure OpenSSL and PostgreSQL client are available (required for Prisma and health checks)
RUN apk add --no-cache openssl postgresql-client

# Create non-root user with home directory
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --home /home/nodejs nodejs && \
    mkdir -p /home/nodejs && \
    chown -R nodejs:nodejs /home/nodejs

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies and Prisma CLI
RUN pnpm install --frozen-lockfile --prod && \
    pnpm add -D prisma@5.7.1 && \
    pnpm store prune

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/scripts ./scripts

# Copy entrypoint script
COPY --chown=nodejs:nodejs docker/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Setup Prisma schema based on DATABASE_URL (if different from build time)
ENV DATABASE_URL=${DATABASE_URL:-postgresql://financeflow:changeme@postgres:5432/financeflow}
RUN node scripts/setup-prisma-schema.js || echo "Warning: Could not setup schema"

# Regenerate Prisma Client as ES Module (required for "type": "module" in package.json)
# Force Prisma to use OpenSSL 3.x binary for Alpine Linux
# Run as root to ensure engines are downloaded
RUN PRISMA_CLI_BINARY_TARGETS=linux-musl-openssl-3.0.x pnpm exec prisma generate || \
    pnpm exec prisma generate

# Ensure Prisma engines are downloaded and accessible
RUN pnpm exec prisma --version || true

# Fix ownership of ALL files and directories before switching user
# This is critical for Prisma to write to engines directory during migrations
RUN chown -R nodejs:nodejs /app && \
    chmod -R u+w /app/node_modules 2>/dev/null || true

# Switch to non-root user
USER nodejs

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "dist/server.js"]
