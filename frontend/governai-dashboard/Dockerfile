# Multi-stage Dockerfile for Next.js app located in the `classic/` folder
# Builder stage: install deps and build the app
FROM node:18-bullseye AS builder
WORKDIR /app

# Install dependencies
COPY classic/package.json classic/package-lock.json* ./
RUN npm install --no-audit --no-fund

# Copy app sources and build
COPY classic/ .
# Ensure `public` exists so later COPY in the runtime stage won't fail
RUN mkdir -p public
RUN npm run build

# Runner stage: smaller image for production runtime
FROM node:18-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy necessary artifacts from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
ENV PORT=3000

# Start the Next.js server
CMD ["npm", "start"]
