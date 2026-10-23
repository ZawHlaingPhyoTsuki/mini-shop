FROM node:24-slim AS builder
RUN npm install -g pnpm@12.8.1
WORKDIR /app

# Manifests first: code-only edits reuse the install layer below.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/server/package.json ./apps/server/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY apps/server/.env.schema ./apps/server/.env.schema
COPY apps/web/.env.schema ./apps/web/.env.schema
RUN --mount=type=secret,id=web_env,target=/app/apps/web/.env.local --mount=type=secret,id=server_env,target=/app/apps/server/.env.local --mount=type=cache,target=/pnpm-store pnpm install --frozen-lockfile --store-dir /pnpm-store

COPY . .

ARG SERVER_URL
ENV SERVER_URL=${SERVER_URL}
ENV NODE_ENV=production
# Filtered install may skip the root postinstall, so generate web env explicitly.
RUN --mount=type=secret,id=web_env,target=/app/apps/web/.env.local pnpm --filter web run env:generate
RUN --mount=type=secret,id=web_env,target=/app/apps/web/.env.local --mount=type=secret,id=server_env,target=/app/apps/server/.env.local cd apps/web && pnpm run build && rm -f .next/standalone/.env* .next/standalone/apps/web/.env*
RUN pnpm deploy --filter web --prod /app/web-deploy
# standalone output excludes public/; ensure it exists so the runner copy never fails
RUN mkdir -p apps/web/public

FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
# auto-load needs Varlock and its production dependencies.
COPY --from=builder /app/web-deploy/node_modules ./node_modules
COPY --from=builder /app/apps/web/.env.schema ./apps/web/.env.schema

ENV HOSTNAME=0.0.0.0
ENV PORT=3001
EXPOSE 3001

WORKDIR /app/apps/web
CMD ["node", "--import", "varlock/auto-load", "server.js"]
