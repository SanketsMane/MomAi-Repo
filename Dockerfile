# Multi-stage Docker build for MOM AI production deployment
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm@10.4.1

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./
COPY packages/ ./packages/
COPY apps/ ./apps/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app

# Build all applications
ENV NODE_ENV=production
RUN pnpm build:prod

# Production stage for web app
FROM node:20-alpine AS web
WORKDIR /app

RUN npm install -g pnpm@10.4.1

# Copy built web application
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/package.json ./apps/web/
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/pnpm-lock.yaml ./

WORKDIR /app/apps/web

EXPOSE 3001

CMD ["pnpm", "start:prod"]

# Production stage for widget app
FROM node:20-alpine AS widget
WORKDIR /app

RUN npm install -g pnpm@10.4.1

# Copy built widget application
COPY --from=builder /app/apps/widget/.next ./apps/widget/.next
COPY --from=builder /app/apps/widget/package.json ./apps/widget/
COPY --from=builder /app/apps/widget/public ./apps/widget/public
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/pnpm-lock.yaml ./

WORKDIR /app/apps/widget

EXPOSE 3002

CMD ["pnpm", "start:prod"]