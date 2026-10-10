# ----------------------------------------------------
# 1. Base Stage
# ----------------------------------------------------
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat

# ----------------------------------------------------
# 2. Dependencies Stage
# ----------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ----------------------------------------------------
# 3. Builder Stage
# ----------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"

# Generate Prisma Client and production bundle
RUN npx prisma generate
RUN npm run build

# ----------------------------------------------------
# 4. Runner Stage (Production)
# ----------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy Nitro bundle, prisma schema & configs, and traced dependencies
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Ensure local uploads directory exists
RUN mkdir -p /app/public/uploads

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
