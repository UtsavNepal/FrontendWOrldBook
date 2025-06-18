#!/bin/sh
set -e

# Export PORT if not set
export PORT=${PORT:-3000}

# Replace environment variables in nginx config
envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx
exec nginx -g 'daemon off;' 