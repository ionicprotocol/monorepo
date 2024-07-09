# Use the foundry image for necessary tools and binaries
FROM ghcr.io/foundry-rs/foundry:nightly-6672134672c8e442684d7d9c51fa8f8717b0f600 as foundry

# Use a Node.js image for Node.js dependencies and runtime
FROM node:14 as build

# Copy forge binary from the foundry image
COPY --from=foundry /usr/local/bin/forge /usr/local/bin/forge

# Install necessary tools for build stage
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# Enable corepack and set yarn version
RUN corepack enable
RUN yarn set version stable

# Set environment variables
ENV HOME=/tmp/build \
    PATH=/tmp/build/node_modules/.bin:./node_modules/.bin:${PATH}

# Set working directory
WORKDIR /tmp/build

# Build arguments
ARG UPTIME_LIQUIDATOR_API
ENV UPTIME_LIQUIDATOR_API=$UPTIME_LIQUIDATOR_API

# Copy necessary files for dependency installation
COPY .yarn .yarn/
COPY .yarnrc.yml .yarnrc.yml

# Required for the checkout process of forge
COPY .gitmodules .gitmodules
COPY .git .git

COPY package.json yarn.lock ./
COPY packages/sdk/package.json packages/sdk/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/chains/package.json packages/chains/package.json
COPY packages/bots/liquidator/package.json packages/bots/liquidator/package.json

# Install dependencies
RUN yarn install --inline-builds --mode=skip-build

# Copy source code
COPY packages/sdk packages/sdk
COPY packages/types packages/types
COPY packages/chains packages/chains
COPY packages/bots/liquidator packages/bots/liquidator

# Build TypeScript code
RUN yarn build:deploy:liquidator

# Runtime stage
FROM node:14 as runtime

# Set NODE_ENV to production
ENV NODE_ENV=production

# Set working directory for runtime
WORKDIR /app

# Copy built files from the build stage
COPY --from=build /tmp/build/dist ./dist
COPY --from=build /tmp/build/node_modules ./node_modules
COPY --from=build /tmp/build/packages ./packages

# Command to run the TypeScript script with ts-node
CMD ["npx", "ts-node", "packages/bots/liquidator/src/runPythLiquidator.ts"]
