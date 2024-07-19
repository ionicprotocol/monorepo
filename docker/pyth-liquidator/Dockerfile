# Use a Node.js base image with yarn pre-installed
FROM node:20 AS base
RUN corepack enable
RUN yarn set version stable

ENV HOME=/tmp/build \
    PATH=/tmp/build/node_modules/.bin:./node_modules/.bin:${PATH}

# Set the working directory inside the container
WORKDIR /tmp/build/

# Install necessary tools and dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    git \
 && rm -rf /var/lib/apt/lists/*


# Use Foundry for the build process
FROM ghcr.io/foundry-rs/foundry:nightly-6672134672c8e442684d7d9c51fa8f8717b0f600 AS foundry

# Final build stage
FROM base AS build
COPY .yarn /tmp/build/.yarn/
COPY .yarnrc.yml /tmp/build/

COPY package.json /tmp/build/
COPY packages/sdk/package.json /tmp/build/packages/sdk/
COPY packages/types/package.json /tmp/build/packages/types/
COPY packages/chains/package.json /tmp/build/packages/chains/
COPY packages/bots/liquidator/package.json /tmp/build/packages/bots/liquidator/
COPY yarn.lock /tmp/build/


# ----- Install dependencies -----
# Install dependencies exactly as in the yarn.lock file - no updates.
RUN yarn install --inline-builds --mode=skip-build

COPY packages/sdk /tmp/build/packages/sdk
COPY packages/types /tmp/build/packages/types
COPY packages/chains /tmp/build/packages/chains
COPY packages/bots/liquidator /tmp/build/packages/bots/liquidator

RUN cat package.json
# Build the application
RUN yarn build:deploy:liquidator

# Use a minimal Node.js runtime image for the final stage
FROM node:latest AS runtime

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the built application from the build stage
COPY --from=build /tmp/build/ /usr/src/app/

CMD ["yarn", "ts-node", "packages/bots/liquidator/src/runPythLiquidator.ts"]