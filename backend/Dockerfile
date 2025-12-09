# Multi-stage Dockerfile for Captain Bitbeard Backend
# Supports both development and production builds
# Multi-arch: linux/amd64, linux/arm64

# Stage 1: Base
FROM node:20-alpine3.18 AS base
WORKDIR /app

# Install dependencies for building native modules and Prisma
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    openssl1.1-compat

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Stage 2: Development
FROM base AS development

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose port
EXPOSE 3001

# Run in development mode with hot reload
CMD ["npm", "run", "dev"]

# Stage 3: Build
FROM base AS build

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Prune dev dependencies
RUN npm prune --production

# Stage 4: Production
FROM node:20-alpine3.18 AS production
WORKDIR /app

# Install dumb-init for proper signal handling and OpenSSL for Prisma
RUN apk add --no-cache dumb-init openssl1.1-compat

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built files from build stage
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist
COPY --from=build --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nodejs:nodejs /app/package*.json ./
COPY --from=build --chown=nodejs:nodejs /app/prisma ./prisma

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
