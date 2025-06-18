#!/bin/sh
set -e

# Export PORT if not set
export PORT=${PORT:-3000}

# Create necessary directories
mkdir -p /var/cache/nginx
mkdir -p /var/log/nginx
mkdir -p /var/run

# Set proper permissions
chown -R nginx:nginx /var/cache/nginx
chown -R nginx:nginx /var/log/nginx
chown -R nginx:nginx /var/run

# Test nginx configuration
echo "Testing Nginx configuration..."
nginx -t

# Start nginx in foreground
echo "Starting Nginx..."
exec nginx -g 'daemon off;' 