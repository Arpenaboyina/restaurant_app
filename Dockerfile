# Multi-stage Dockerfile for building both frontend and backend
# This is useful for building the entire application stack

FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force
COPY backend/src ./src

FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci && npm cache clean --force
COPY frontend/ .
RUN npm run build

# Backend production image
FROM node:20-alpine AS backend
WORKDIR /app
COPY --from=backend-builder /app/backend .
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app
USER nodejs
EXPOSE 4000
ENV NODE_ENV=production
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
CMD ["npm", "start"]

# Frontend production image
FROM nginx:1.27-alpine AS frontend
COPY --from=frontend-builder /app/frontend/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf && \
    echo 'server { \
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
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1
CMD ["nginx", "-g", "daemon off;"]

