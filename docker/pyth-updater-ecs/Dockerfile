# Base image: Use a standard Node.js image for ECS instead of Lambda-specific
FROM node:20 as build

# Install dependencies
RUN apt-get update && apt-get install -y git

# Enable Yarn and set the stable version
RUN corepack enable
RUN yarn set version stable

ENV HOME=/tmp/build \
    PATH=/tmp/build/node_modules/.bin:./node_modules/.bin:${PATH}

WORKDIR /tmp/build

ARG TEMP_DEPS_DIR

ARG UPTIME_PYTH_UPDATER_API
ENV UPTIME_PYTH_UPDATER_API=$UPTIME_PYTH_UPDATER_API

# Copy necessary files to leverage Docker cache
COPY .yarn /tmp/build/.yarn/
COPY .yarnrc.yml /tmp/build/

COPY package.json /tmp/build/
COPY packages/sdk/package.json /tmp/build/packages/sdk/
COPY packages/types/package.json /tmp/build/packages/types/
COPY packages/chains/package.json /tmp/build/packages/chains/
COPY packages/bots/pyth-updater/package.json /tmp/build/packages/bots/pyth-updater/
COPY yarn.lock /tmp/build/

# Install dependencies
RUN yarn install --inline-builds --mode=skip-build

# Copy source code
COPY packages/sdk /tmp/build/packages/sdk
COPY packages/types /tmp/build/packages/types
COPY packages/chains /tmp/build/packages/chains
COPY packages/bots/pyth-updater /tmp/build/packages/bots/pyth-updater

# Build the project
RUN yarn build:deploy:pyth-updater

# Production stage
FROM node:20 as runtime

ENV NODE_ENV=production

# Set the working directory
WORKDIR /usr/src/app

# Copy the build from the previous stage
COPY --from=build /tmp/build /usr/src/app

# Command to run your bot in ECS
CMD ["node", "packages/bots/pyth-updater/build/src/run.js"]