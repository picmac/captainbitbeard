# Multi-stage Dockerfile for Captain Bitbeard Frontend
# Supports both development and production builds
# Multi-arch: linux/amd64, linux/arm64

# Stage 1: Base
FROM node:20-alpine AS base
WORKDIR /app

# Copy package files
COPY package*.json ./

# Stage 2: Development
FROM base AS development

# Install all dependencies
RUN npm ci

# Copy source and public directories
COPY . .

# Expose Vite dev server port
EXPOSE 3000

# Run Vite dev server with hot reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Stage 3: Build
FROM base AS build

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build for production
RUN npm run build

# Stage 4: Production (Nginx)
FROM nginx:alpine AS production

# Install dumb-init
RUN apk add --no-cache dumb-init

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Create non-root user for nginx
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -u 1001 && \
    chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-user /var/run/nginx.pid

# Switch to non-root user
USER nginx-user

# Expose port 3000 (to match dev)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Run nginx
ENTRYPOINT ["dumb-init", "--"]
CMD ["nginx", "-g", "daemon off;"]
