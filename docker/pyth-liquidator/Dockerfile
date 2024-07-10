# Base stage for building the application
FROM node:18 as base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
 && rm -rf /var/lib/apt/lists/*

# Install Corepack globally
RUN npm install -g corepack

# Set working directory
WORKDIR /tmp/build

# Copy package.json and yarn.lock to /tmp/build directory
COPY package.json yarn.lock .yarnrc.yml .gitmodules .git /tmp/build/

# Copy specific package.json files for dependencies
COPY packages/sdk/package.json packages/sdk/
COPY packages/types/package.json packages/types/
COPY packages/chains/package.json packages/chains/
COPY packages/bots/liquidator/package.json packages/bots/liquidator/

# Copy the rest of the directories
COPY packages/sdk /tmp/build/packages/sdk
COPY packages/types /tmp/build/packages/types
COPY packages/chains /tmp/build/packages/chains
COPY packages/bots/liquidator /tmp/build/packages/bots/liquidator

# Clear npm/yarn cache
RUN npm cache clean --force

# Install Yarn
RUN curl -o- -L https://yarnpkg.com/install.sh | bash

# Install dependencies exactly as in the yarn.lock file
# RUN yarn install --frozen-lockfile

# Build the application
RUN yarn build:deploy:liquidator

# Runtime stage for running the application
FROM node:16 as runtime

# Install Yarn
RUN curl -o- -L https://yarnpkg.com/install.sh | bash

# Set environment variables and working directory
ENV NODE_ENV=production \
    HOME=/usr/src/app

WORKDIR $HOME

# Copy built application from base stage
COPY --from=base /tmp/build/packages/bots/liquidator/build/bots/liquidator/src /usr/src/app

# Define the command to start the application
CMD ["node", "runPythLiquidator.js"]
