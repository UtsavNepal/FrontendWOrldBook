#!/bin/sh
set -e

# Export PORT if not set
export PORT=${PORT:-3000}

# Print environment for debugging
echo "=== Environment ==="
echo "PORT: $PORT"
echo "Current directory: $(pwd)"
echo "=== Directory Contents ==="
ls -la /usr/share/nginx/html
echo "=== File Tree ==="
find /usr/share/nginx/html -type f

# Create nginx directories if they don't exist
mkdir -p /etc/nginx/conf.d
mkdir -p /etc/nginx/templates

# Replace environment variables in nginx config
echo "=== Generating Nginx Config ==="
envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Print nginx config for debugging
echo "=== Nginx Configuration ==="
cat /etc/nginx/conf.d/default.conf

# Test nginx configuration
echo "=== Testing Nginx Configuration ==="
nginx -t

# Start nginx
echo "=== Starting Nginx ==="
exec nginx -g 'daemon off;' 