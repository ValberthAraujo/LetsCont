FROM node:20-bullseye-slim AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .

# Build-time configuration for Vite
ARG VITE_API_URL
ARG VITE_PUBLIC_KEY
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_PUBLIC_KEY=${VITE_PUBLIC_KEY}

RUN npm run build

# Production image to serve static files
FROM nginx:1.27-alpine AS runner

# Replace default config with SPA-friendly one
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

