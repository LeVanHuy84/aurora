# Multi-stage Dockerfile for NestJS API in Monorepo
FROM node:20-alpine AS base

# Install OpenSSL for Prisma engine & pnpm
RUN apk add --no-cache openssl
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

# Install OpenSSL required by Prisma runtime on Alpine
RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV PORT=3000

# Security: Create non-root user and group
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Install pnpm for production runner
RUN npm install -g pnpm@10.15.1

# Copy node_modules (including generated Prisma Client) from builder stage
COPY --chown=nestjs:nodejs --from=builder /app/node_modules ./node_modules
COPY --chown=nestjs:nodejs --from=builder /app/packages/types/node_modules ./packages/types/node_modules
COPY --chown=nestjs:nodejs --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --chown=nestjs:nodejs --from=builder /app/packages/types/dist ./packages/types/dist
COPY --chown=nestjs:nodejs --from=builder /app/packages/types/package.json ./packages/types/package.json
COPY --chown=nestjs:nodejs --from=builder /app/apps/api/dist ./apps/api/dist
COPY --chown=nestjs:nodejs --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --chown=nestjs:nodejs --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --chown=nestjs:nodejs --from=builder /app/package.json /app/pnpm-workspace.yaml ./

USER nestjs

EXPOSE 3000

WORKDIR /app/apps/api
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
