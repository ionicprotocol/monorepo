# Use a Node.js base image with yarn pre-installed
FROM node:latest
FROM ghcr.io/foundry-rs/foundry:nightly-6672134672c8e442684d7d9c51fa8f8717b0f600 as foundry
FROM node as build

COPY --from=foundry /usr/local/bin/forge /usr/local/bin/forge
# Set the working directory inside the container
WORKDIR /usr/src/app

# Install necessary tools and dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    git \
 && rm -rf /var/lib/apt/lists/*

# Install Corepack globally (optional, if needed)
RUN npm install -g corepack

# Copy the rest of your application code
COPY . .

RUN curl -L https://foundry.paradigm.xyz | bash && \
    bash -c "source ~/.bashrc && ~/.foundry/bin/foundryup"
# Install Yarn (optional, if needed)
RUN curl -o- -L https://yarnpkg.com/install.sh | bash

# Copy package.json and yarn.lock to install dependencies
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install 


# Build the application
RUN yarn build:deploy:liquidator

# Run your TypeScript file with ts-node
CMD ["yarn", "ts-node", "packages/bots/liquidator/src/runPythLiquidator.ts"]
