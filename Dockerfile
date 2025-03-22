# syntax = docker/dockerfile:1

ARG NODE_VERSION=22.14.0
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js"

WORKDIR /app
ENV NODE_ENV="production"

ARG PNPM_VERSION=9.15.2
RUN npm install -g pnpm@$PNPM_VERSION

FROM base AS build
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# まずはすべてコピー
COPY . .

RUN pnpm install --frozen-lockfile --prod=false
RUN pnpm run build
RUN pnpm prune --prod

FROM base
COPY --from=build /app /app

EXPOSE 8000
CMD [ "pnpm", "run", "start" ]
