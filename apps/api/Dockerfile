# Multi-stage build for production
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

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
# This script detects if we're using PostgreSQL or SQLite and adjusts the schema
ARG DATABASE_URL=file:./prisma/dummy.db
ENV DATABASE_URL=$DATABASE_URL
RUN node scripts/setup-prisma-schema.js

# Generate Prisma Client
# Prisma needs a valid DATABASE_URL format to validate schema during build
# The real DATABASE_URL will be provided at runtime via environment variables
RUN pnpm prisma generate

# Build TypeScript
RUN ls -la tsconfig.json && pnpm exec tsc -p tsconfig.json

# Fix imports to add .js extensions (required for ES modules)
RUN node scripts/fix-imports.js || echo "Warning: Could not fix imports"

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod && \
    pnpm store prune

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/scripts ./scripts

# Install Prisma CLI temporarily to generate Prisma Client
# Prisma CLI is needed to generate the client, but @prisma/client is already installed
RUN pnpm add -D prisma@5.7.1

# Setup Prisma schema based on DATABASE_URL (if different from build time)
# Use the runtime DATABASE_URL or default to SQLite
# This must run as root before switching to nodejs user
ENV DATABASE_URL=${DATABASE_URL:-file:./prisma/dev.db}
RUN node scripts/setup-prisma-schema.js || echo "Warning: Could not setup schema"

# Generate Prisma Client for production
RUN pnpm exec prisma generate

# Fix ownership of prisma directory before switching user
RUN chown -R nodejs:nodejs /app/prisma /app/dist /app/node_modules/.prisma 2>/dev/null || true

# Switch to non-root user
USER nodejs

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/server.js"]
