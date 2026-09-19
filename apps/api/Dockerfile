# Multi-stage Dockerfile for NestJS API in Monorepo
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm@10.15.1

WORKDIR /app

# Stage 1: Dependencies
FROM base AS dependencies
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/types/package.json ./packages/types/
COPY apps/api/package.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma/

RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM dependencies AS builder
WORKDIR /app

COPY packages/types ./packages/types
COPY apps/api ./apps/api
COPY turbo.json ./

# Build @aurora/types first
RUN pnpm --filter @aurora/types build

# Generate Prisma Client
RUN pnpm --filter api exec prisma generate

# Build API
RUN pnpm --filter api build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Security: run as non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Install pnpm for production run
RUN npm install -g pnpm@10.15.1

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=dependencies /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/packages/types/package.json ./packages/types/package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml ./

USER nestjs

EXPOSE 3000

WORKDIR /app/apps/api
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
