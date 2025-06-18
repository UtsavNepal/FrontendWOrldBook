#!/bin/sh
set -e

# Export PORT if not set
export PORT=${PORT:-3000}

# Print environment for debugging
echo "Starting with PORT: $PORT"
echo "Current directory: $(pwd)"
echo "Contents of /usr/share/nginx/html:"
ls -la /usr/share/nginx/html

# Replace environment variables in nginx config
envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Print nginx config for debugging
echo "Nginx configuration:"
cat /etc/nginx/conf.d/default.conf

# Start nginx
echo "Starting nginx..."
exec nginx -g 'daemon off;' 