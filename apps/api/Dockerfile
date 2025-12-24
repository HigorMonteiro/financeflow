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

# Generate Prisma Client
# Prisma needs a valid DATABASE_URL format to validate schema during build
# We use a dummy URL since we don't need to connect during build
# The real DATABASE_URL will be provided at runtime via environment variables
ARG DATABASE_URL=postgresql://dummy:dummy@dummy:5432/dummy
ENV DATABASE_URL=$DATABASE_URL
RUN pnpm prisma generate

# Build TypeScript
RUN ls -la tsconfig.json && pnpm exec tsc -p tsconfig.json

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

# Install Prisma CLI temporarily to generate Prisma Client
# Prisma CLI is needed to generate the client, but @prisma/client is already installed
RUN pnpm add -D prisma@5.7.1

# Generate Prisma Client for production
# We use a dummy DATABASE_URL since we only need to generate the client, not connect
ENV DATABASE_URL=postgresql://dummy:dummy@dummy:5432/dummy
RUN pnpm exec prisma generate

# Switch to non-root user
USER nodejs

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/server.js"]
