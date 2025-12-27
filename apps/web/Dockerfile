FROM node:20-alpine AS base

RUN npm install -g pnpm pm2

FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile --prod=false

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml

COPY . .

ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL
ENV NODE_ENV=production

RUN pnpm build:skip-check

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install --no-frozen-lockfile --prod && \
    pnpm store prune

COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --chown=nodejs:nodejs server.js ./
COPY --chown=nodejs:nodejs ecosystem.config.cjs ./
COPY --chown=nodejs:nodejs entrypoint.sh ./

RUN mkdir -p logs && chown -R nodejs:nodejs logs && \
    chmod +x entrypoint.sh

USER nodejs

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

ENV PORT=80
ENV NODE_ENV=production

ENTRYPOINT ["./entrypoint.sh"]
