FROM ghcr.io/foundry-rs/foundry:nightly-4604a420c5e23d206ec949219171cb3701e54e28 as foundry

FROM node:16.13.0 as builder


COPY --from=foundry /usr/local/bin/forge /usr/local/bin/forge

ENV HOME=/tmp/build \
    PATH=/tmp/build/node_modules/.bin:./node_modules/.bin:${PATH}

WORKDIR /tmp/build

ARG TEMP_DEPS_DIR

# ----- Copy only the files that affect yarn install -----
# Allows docker to use cache and skip install if dependencies are unchanged.
# Assumes that ./packages/*/package.json files have been copied to TEMP_DEPS_DIR
# with that same directory structure. build.sh does this.
COPY .yarn /tmp/build/.yarn/
COPY .yarnrc.yml /tmp/build/


COPY package.json /tmp/build/
COPY packages/sdk/package.json /tmp/build/packages/sdk/

RUN touch /tmp/build/yarn.lock

# ----- Install dependencies -----
# Install dependencies exactly as in the yarn.lock file - no updates.
RUN yarn install

# ----- Copy source and all other files that affect lint, test, build -----
COPY packages/sdk /tmp/build/packages/sdk

RUN yarn build:all


CMD ["yarn", "workspace", "@midas-capital/sdk", "hardhat", "node", "--no-deploy"]
