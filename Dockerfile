# Use the official Node.js 18 image
FROM node:18-alpine AS base

# Rebuild the source code only when needed
FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install ALL dependencies (production + dev) needed for building
COPY package.json package-lock.json* ./

# Skip scripts during install to avoid Husky hooks
ENV HUSKY=0
RUN npm ci --ignore-scripts

# Copy source code FIRST
COPY . .

# Use PostgreSQL schema for Railway production builds
ARG NODE_ENV=production
# Override with PostgreSQL schema for production (after copying source)
COPY prisma/schema.postgresql.prisma ./prisma/schema.prisma

# Generate Prisma Client with PostgreSQL schema
RUN npx prisma generate

# Verify the schema being used
RUN echo "Using schema:" && head -10 ./prisma/schema.prisma

# Disable telemetry during the build
ENV NEXT_TELEMETRY_DISABLED 1

# Build the application with all dependencies available
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the public folder
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Install Prisma CLI for migrations in production
RUN npm install -g prisma

# Copy PostgreSQL schema for production runtime
COPY --from=builder /app/prisma/schema.postgresql.prisma ./prisma/schema.prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy the original PostgreSQL schema file as well for reference
COPY --from=builder /app/prisma/schema.postgresql.prisma ./prisma/schema.postgresql.prisma

# Copy startup script for debugging
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

USER nextjs

EXPOSE 8080

ENV PORT 8080
ENV HOSTNAME "0.0.0.0"
ENV NODE_ENV production

# Use startup script for debugging, then start server
CMD ["./start.sh"]