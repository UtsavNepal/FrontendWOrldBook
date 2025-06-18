# Frontend Dockerfile
FROM node:20-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Verify build output
RUN ls -la /app/dist
RUN echo "Build completed successfully"

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh

# Create nginx directories and verify setup
RUN mkdir -p /etc/nginx/templates && \
    mkdir -p /etc/nginx/conf.d && \
    chmod +x /docker-entrypoint.sh && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    ls -la /usr/share/nginx/html && \
    echo "Nginx setup completed successfully"

EXPOSE 3000
ENTRYPOINT ["/docker-entrypoint.sh"] 