# Multi-Stage Dockerfile for TaskPulse Enterprise SaaS Application

# Stage 1: Build Frontend React Assets
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and client package files
COPY package.json package-lock.json ./
COPY client/package.json client/package-lock.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy application source code
COPY . .

# Build production bundle
RUN cd client && npm run build

# Stage 2: Production Server Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy built assets and server source
COPY package.json package-lock.json ./
RUN npm install --only=production

COPY --from=builder /app/client/dist ./client/dist
COPY server ./server

EXPOSE 5000

CMD ["node", "server/index.js"]
