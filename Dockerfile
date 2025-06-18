# Frontend Dockerfile
FROM node:20-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Create entrypoint script
RUN echo '#!/bin/sh\n\
envsubst < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf\n\
nginx -g "daemon off;"' > /docker-entrypoint.sh && \
chmod +x /docker-entrypoint.sh

# Create nginx directories
RUN mkdir -p /etc/nginx/templates && \
    mkdir -p /etc/nginx/conf.d

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE $PORT
ENTRYPOINT ["/docker-entrypoint.sh"] 