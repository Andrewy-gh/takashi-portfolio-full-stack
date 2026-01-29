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


# Install server dependencies
FROM base as server-deps
WORKDIR /app/server
# Install packages needed to build node modules
RUN apt-get update -qq && \
  apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3
COPY --link server/package.json server/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
# Copy only runtime server source (avoid node_modules/.env)
COPY --link server/hono ./hono
COPY --link server/drizzle.config.ts ./drizzle.config.ts

# Final stage for app image
FROM base as runtime
ENV NODE_ENV="production"
WORKDIR /app/server
# Copy server + node_modules
COPY --from=server-deps /app/server /app/server

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "pnpm", "run", "start" ]
