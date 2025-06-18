# Frontend Dockerfile
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Verify build output
RUN echo "=== Build Output ===" && \
    ls -la /app/dist && \
    echo "=== Contents of dist directory ===" && \
    find /app/dist -type f && \
    echo "=== Build completed ==="

# Production stage
FROM nginx:alpine

# Install necessary packages
RUN apk add --no-cache bash curl sed

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh

# Setup nginx
RUN mkdir -p /var/cache/nginx && \
    mkdir -p /var/log/nginx && \
    mkdir -p /var/run && \
    chmod +x /docker-entrypoint.sh && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /var/run && \
    chmod -R 755 /usr/share/nginx/html && \
    # Verify static files
    echo "=== Static Files ===" && \
    ls -la /usr/share/nginx/html && \
    echo "=== Contents of html directory ===" && \
    find /usr/share/nginx/html -type f

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-80}/ || exit 1

EXPOSE ${PORT:-80}
ENTRYPOINT ["/docker-entrypoint.sh"] 