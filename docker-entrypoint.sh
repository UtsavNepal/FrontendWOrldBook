#!/bin/sh
set -e

# Export PORT if not set
export PORT=${PORT:-80}

# Create necessary directories
mkdir -p /var/cache/nginx
mkdir -p /var/log/nginx
mkdir -p /var/run

# Set proper permissions
chown -R nginx:nginx /var/cache/nginx
chown -R nginx:nginx /var/log/nginx
chown -R nginx:nginx /var/run

# Create a temporary nginx configuration with the correct port
cat > /tmp/nginx.conf << EOF
$(cat /etc/nginx/nginx.conf | sed "s/listen 80/listen ${PORT}/")
EOF

# Replace the original nginx configuration
mv /tmp/nginx.conf /etc/nginx/nginx.conf

# Test nginx configuration
echo "Testing Nginx configuration..."
nginx -t

# Start nginx in foreground
echo "Starting Nginx..."
exec nginx -g 'daemon off;' 