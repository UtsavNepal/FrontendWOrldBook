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
echo "Testing Nginx configuration..."
nginx -t

# Start nginx in foreground
echo "Starting Nginx..."
exec nginx -g 'daemon off;' 