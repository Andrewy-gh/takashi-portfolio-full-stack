# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.10.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Node.js"

# Node.js app lives here
WORKDIR /app

# Install pnpm
ARG PNPM_VERSION=9.5.0
RUN npm install -g pnpm@$PNPM_VERSION
RUN apt-get update -qq && \
  apt-get install --no-install-recommends -y ca-certificates


# Install server dependencies
FROM base as server-deps
WORKDIR /app
# Install packages needed to build node modules
RUN apt-get update -qq && \
  apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3
COPY --link package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --link server/package.json ./server/package.json
RUN pnpm install --frozen-lockfile --filter takashi-photos...
# Copy only runtime server source (avoid .env)
COPY --link server/hono ./server/hono
COPY --link server/drizzle.config.ts ./server/drizzle.config.ts

# Build dashboard static assets
FROM base as dashboard-build
WORKDIR /app
COPY --link package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --link dashboard/package.json ./dashboard/package.json
COPY --link server/package.json ./server/package.json
RUN pnpm install --frozen-lockfile
COPY --link dashboard ./dashboard
COPY --link server/hono ./server/hono
RUN pnpm -C dashboard build

# Final stage for app image
FROM base as runtime
ENV NODE_ENV="production"
WORKDIR /app
# Copy server + node_modules
COPY --from=server-deps /app /app
COPY --from=dashboard-build /app/dashboard/dist /app/server/dashboard-dist

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "pnpm", "-C", "server", "run", "start" ]
