#!/bin/sh
set -e

# Create necessary directories
mkdir -p /var/cache/nginx
mkdir -p /var/log/nginx
mkdir -p /var/run

# Set permissions
chown -R nginx:nginx /var/cache/nginx
chown -R nginx:nginx /var/log/nginx
chown -R nginx:nginx /var/run

# Replace PORT in nginx.conf
PORT=${PORT:-3000}
sed -i "s/\${PORT:-3000}/$PORT/g" /etc/nginx/nginx.conf

# Test backend connectivity with detailed output
echo "Testing backend connectivity..."
echo "=== Backend Test ==="
curl -v -I https://backendworldbook.up.railway.app/ 2>&1 | tee /tmp/backend_test.log
echo "=== Backend Test Complete ==="

# Check if backend is responding with expected content
echo "Testing backend content..."
echo "=== Backend Content Test ==="
curl -v https://backendworldbook.up.railway.app/ 2>&1 | tee /tmp/backend_content.log
echo "=== Backend Content Test Complete ==="

# Test nginx configuration
echo "Testing nginx configuration..."
nginx -t

# Start nginx in foreground
echo "Starting nginx on port $PORT..."
nginx -g 'daemon off;' 