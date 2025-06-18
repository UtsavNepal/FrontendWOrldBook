# Build stage
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Verify build output
RUN echo "=== Build Output ===" && \
    ls -la dist/ && \
    echo "=== Contents of dist directory ===" && \
    find dist -type f && \
    echo "=== Build completed ==="

# Production stage
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Create necessary directories and set permissions
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /var/run /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose the port (will be overridden by Railway)
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV VITE_BACKEND_URL=https://backendworldbook.up.railway.app

# Start the application
ENTRYPOINT ["/docker-entrypoint.sh"] 