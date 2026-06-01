# syntax=docker/dockerfile:1.6
# ---------- builder ----------
FROM node:22-slim AS builder

WORKDIR /app

# Copy manifest files first to leverage Docker layer cache.
# Use `npm install` (not `npm ci`) so the build is robust whether or not a
# committed lockfile is present. --no-audit / --no-fund keep logs clean.
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then \
      npm ci --no-audit --no-fund; \
    else \
      npm install --no-audit --no-fund; \
    fi

COPY . .

ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---------- runtime ----------
FROM nginx:1.27-alpine AS runtime

RUN apk add --no-cache curl bash gettext

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/conf.d/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -fsS http://localhost:80/ || exit 1

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
