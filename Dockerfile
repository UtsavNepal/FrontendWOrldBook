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

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh

# Setup nginx
RUN mkdir -p /etc/nginx/templates && \
    mkdir -p /etc/nginx/conf.d && \
    chmod +x /docker-entrypoint.sh && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    echo "=== Nginx Setup ===" && \
    ls -la /usr/share/nginx/html && \
    echo "=== Contents of nginx html directory ===" && \
    find /usr/share/nginx/html -type f && \
    echo "=== Setup completed ==="

EXPOSE 3000
ENTRYPOINT ["/docker-entrypoint.sh"] 