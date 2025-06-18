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

# Create a temporary nginx configuration file with the correct port
cat > /tmp/nginx.conf << EOF
worker_processes 4;
error_log /dev/stderr debug;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    multi_accept on;
    use epoll;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    access_log /dev/stdout combined;
    error_log /dev/stderr debug;
    
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;
    
    server {
        listen ${PORT:-3000};
        server_name worldbook.up.railway.app;
        
        root /usr/share/nginx/html;
        index index.html;
        
        location / {
            try_files \$uri \$uri/ /index.html;
        }
        
        location /api/ {
            rewrite ^/api/(.*) /\$1 break;
            proxy_pass https://backendworldbook.up.railway.app;
            proxy_http_version 1.1;
            proxy_set_header Host backendworldbook.up.railway.app;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            
            # CORS headers
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' '*' always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            
            if (\$request_method = 'OPTIONS') {
                add_header 'Access-Control-Allow-Origin' '*' always;
                add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
                add_header 'Access-Control-Allow-Headers' '*' always;
                add_header 'Access-Control-Allow-Credentials' 'true' always;
                add_header 'Access-Control-Max-Age' 1728000;
                add_header 'Content-Type' 'text/plain; charset=utf-8';
                add_header 'Content-Length' 0;
                return 204;
            }
        }
    }
}
EOF

# Test backend connectivity
echo "Testing backend connectivity..."
curl -v https://backendworldbook.up.railway.app/ > /tmp/backend_test.log 2>&1
if [ $? -eq 0 ]; then
    echo "Backend is accessible"
    cat /tmp/backend_test.log
else
    echo "Warning: Backend might not be accessible"
    cat /tmp/backend_test.log
fi

# Test nginx configuration
echo "Testing nginx configuration..."
nginx -t -c /tmp/nginx.conf

# Start nginx with the temporary configuration
echo "Starting nginx on port ${PORT:-3000}..."
nginx -c /tmp/nginx.conf -g 'daemon off;' 