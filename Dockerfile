FROM node:22-bookworm-slim AS base

WORKDIR /app

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps

COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN export AUTH_SECRET=docker-build-auth-secret-at-least-32-characters \
  AUTH_TRUST_HOST=true \
  DATABASE_URL=postgresql://documind:documind@localhost:5432/documind?schema=public \
  && npx prisma generate \
  && npm run build

FROM base AS runner

WORKDIR /app

ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PORT=3000

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app ./

RUN mkdir -p /app/uploads/documents \
  && chown -R nextjs:nodejs /app/uploads

USER nextjs

EXPOSE 3000

CMD ["npm", "run", "start"]
