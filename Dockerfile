FROM node:20-slim
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy workspace manifests first (layer cache)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY libs/types/package.json ./libs/types/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

RUN pnpm install --no-frozen-lockfile

# Copy source
COPY libs/types ./libs/types
COPY apps/api ./apps/api

# Build shared types → generate Prisma client → build API
RUN pnpm --filter @vyntra/types build
RUN pnpm --filter @vyntra/api exec prisma generate
RUN pnpm --filter @vyntra/api build

WORKDIR /app/apps/api

RUN chmod +x start.sh

EXPOSE 3001

CMD ["bash", "start.sh"]
