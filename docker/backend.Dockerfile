# syntax=docker/dockerfile:1
#
# NestJS backend image (todo). Rendered by the platform's golden path;
# edit freely, `copier update` shows template changes as a diff.
#
# Build (context is ./backend, so docker/backend.Dockerfile.dockerignore applies):
#   docker build -f docker/backend.Dockerfile -t todo-backend:dev backend
#
# The same image serves two purposes:
#   app:        node dist/main.js                                (default CMD)
#   migrations: node node_modules/typeorm/cli.js migration:run -d dist/data-source.js
#               (compiled migrations, plain node: no Yarn/npm at runtime)

# Pinned by tag AND digest: the tag documents the version for humans, the digest
# guarantees the exact bytes. Renovate bumps both together.
ARG NODE_IMAGE=node:22.23.3-alpine3.24@sha256:0a7108bf6c7bf5de370ffb1a3ed6be93d405b43ff159f681a8d18c0e2bc2e402

# --- base: shared OS layer ----------------------------------------------------
FROM ${NODE_IMAGE} AS base
WORKDIR /app

# --- build: full toolchain, compiles TypeScript ---------------------------------
FROM base AS build
# The manifests are bind-mounted, not copied: they never become a layer, and the
# package manager's download cache lives in a BuildKit cache mount. sharing=locked:
# BuildKit runs stages in parallel and Yarn classic's cache breaks with two writers
# ("Integrity check failed", half-written tarballs); one install at a time.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    --mount=type=cache,target=/usr/local/share/.cache/yarn,sharing=locked \
    yarn install --frozen-lockfile
COPY . .
RUN yarn build

# --- prod-deps: runtime dependencies only ---------------------------------------
FROM base AS prod-deps
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    --mount=type=cache,target=/usr/local/share/.cache/yarn,sharing=locked \
    yarn install --frozen-lockfile --production

# --- runtime --------------------------------------------------------------------
FROM base AS runtime
# The runtime never installs packages, so drop the package managers that ship
# with the base image: less to patch (Trivy flags npm's own bundled deps) and
# nothing for an attacker to install tools with.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
    /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \
    /opt/yarn-* /usr/local/bin/yarn /usr/local/bin/yarnpkg

ENV NODE_ENV=production \
    PORT=3001

# --link: each copy is its own layer, reused even when earlier layers change.
COPY --link --from=prod-deps /app/node_modules ./node_modules
COPY --link --from=build /app/dist ./dist
COPY --link package.json ./

# Links the image to its repo in GHCR (visibility, permissions, README).
LABEL org.opencontainers.image.source="https://github.com/DEVOPS-CANARY/todo-app"

# Files stay owned by root and are only readable by the app user, so a
# compromised process cannot rewrite its own code. Numeric UID:GID (the image's
# `node` user) lets Kubernetes' runAsNonRoot verify the user is not root.
USER 1000:1000

EXPOSE 3001
# exec form: node is PID 1 and receives SIGTERM directly -> enableShutdownHooks()
CMD ["node", "dist/main.js"]
