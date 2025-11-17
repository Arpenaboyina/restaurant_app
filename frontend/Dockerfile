FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:1.27-alpine

# Copy built files
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Add custom nginx config for SPA
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /health { \
        access_log off; \
        return 200 "healthy\n"; \
        add_header Content-Type text/plain; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]


