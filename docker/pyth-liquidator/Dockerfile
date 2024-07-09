FROM ghcr.io/foundry-rs/foundry:nightly-6672134672c8e442684d7d9c51fa8f8717b0f600 as foundry

FROM node as build

COPY --from=foundry /usr/local/bin/forge /usr/local/bin/forge

RUN dnf update -y 
RUN dnf install -y git 

RUN corepack enable
RUN yarn set version stable

ENV HOME=/tmp/build \
    PATH=/tmp/build/node_modules/.bin:./node_modules/.bin:${PATH}

WORKDIR /tmp/build

ARG TEMP_DEPS_DIR

ARG UPTIME_LIQUIDATOR_API
ENV UPTIME_LIQUIDATOR_API=$UPTIME_LIQUIDATOR_API

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

# ----- Install dependencies -----
# Install dependencies exactly as in the yarn.lock file - no updates.
RUN yarn install --inline-builds --mode=skip-build

# ----- Copy source and all other files that affect lint, test, build -----
COPY packages/sdk /tmp/build/packages/sdk
COPY packages/types /tmp/build/packages/types
COPY packages/chains /tmp/build/packages/chains
COPY packages/bots/liquidator /tmp/build/packages/bots/liquidator

# ----- build -----
RUN yarn build:deploy:liquidator

# ----------------------------------------
# Copy files to the deployment image.
# ----------------------------------------

FROM node as runtime

ENV NODE_ENV=production
# Command to run the TypeScript script with ts-node
CMD ["ts-node", "packages/bots/liquidator/src/runPythLiquidator.ts"]
