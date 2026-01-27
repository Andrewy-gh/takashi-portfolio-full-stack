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


# Build the client assets
FROM base as client-build
ENV NODE_ENV="development"
WORKDIR /app/client
COPY --link client/package.json client/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY --link client/ ./
RUN pnpm run build

# Install server dependencies
FROM base as server-deps
ENV NODE_ENV="production"
WORKDIR /app/server
# Install packages needed to build node modules
RUN apt-get update -qq && \
  apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3
COPY --link server/package.json server/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
# Copy only runtime server source (avoid node_modules/.env)
COPY --link server/app.js server/index.js ./
COPY --link server/controllers ./controllers
COPY --link server/models ./models
COPY --link server/routes ./routes
COPY --link server/utils ./utils

# Final stage for app image
FROM base as runtime
ENV NODE_ENV="production"
WORKDIR /app/server
# Copy server + node_modules, then client build output
COPY --from=server-deps /app/server /app/server
COPY --from=client-build /app/client/dist /app/server/dist

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "pnpm", "run", "start" ]
