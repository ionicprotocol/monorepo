# Use the foundry image for necessary tools and binaries
FROM ghcr.io/foundry-rs/foundry:nightly-6672134672c8e442684d7d9c51fa8f8717b0f600 as foundry

# Use a Node.js image for Node.js dependencies and runtime
FROM node:14 as node

# Use the foundry image to copy necessary binaries
COPY --from=foundry /usr/local/bin/forge /usr/local/bin/forge

# Install necessary tools for build stage
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy necessary files for dependency installation
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript code
RUN yarn build:deploy:liquidator

# Runtime stage
FROM node:14 as runtime
COPY .yarn /tmp/build/.yarn/
COPY .yarnrc.yml /tmp/build/

# required for the checkout process of forge
COPY .gitmodules .gitmodules
COPY .git .git

COPY package.json /tmp/build/
COPY packages/sdk/package.json /tmp/build/packages/sdk/
COPY packages/types/package.json /tmp/build/packages/types/
COPY packages/chains/package.json /tmp/build/packages/chains/
COPY packages/bots/liquidator/package.json /tmp/build/packages/bots/liquidator/
COPY yarn.lock /tmp/build/
# ----- Copy source and all other files that affect lint, test, build -----
COPY packages/sdk /tmp/build/packages/sdk
COPY packages/types /tmp/build/packages/types
COPY packages/chains /tmp/build/packages/chains
COPY packages/bots/liquidator /tmp/build/packages/bots/liquidator
# Set NODE_ENV to production
ENV NODE_ENV=production

# Set working directory for runtime
WORKDIR /app


# Copy built files from the build stage
COPY --from=node /app/dist ./dist
COPY --from=node /app/node_modules ./node_modules

# Command to run the TypeScript script with ts-node
CMD ["ts-node", "packages/bots/liquidator/src/runPythLiquidator.ts"]
