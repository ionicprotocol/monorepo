FROM node:16.13-alpine as base

FROM node as build

RUN apt update
RUN apt install git

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
COPY packages/fuse-twap-bot/package.json /tmp/build/packages/fuse-twap-bot/
RUN touch /tmp/build/yarn.lock

# ----- Install dependencies -----
# Install dependencies exactly as in the yarn.lock file - no updates.
RUN SKIP_FORGE=1 yarn install

# ----- Copy source and all other files that affect lint, test, build -----
COPY packages/sdk /tmp/build/packages/sdk
COPY packages/fuse-twap-bot /tmp/build/packages/fuse-twap-bot

# ----- Lint, test and build -----
RUN SKIP_FORGE=1 yarn build

# ----------------------------------------
# Copy files to the deployment image.
# ----------------------------------------

FROM node as runtime

RUN npm install pm2 -pg

# ----- Copy files required at runtime by the app -----
COPY --from=build --chown=node:node /tmp/build /home/node

# This user is created in the base image with uid and gid = 1000.
USER node

WORKDIR /home/node/packages/fuse-twap-bot

EXPOSE 8080

CMD ["pm2-runtime", "ecosystem.config.js", "--env", "development"]



#FROM base AS dependencies
#
#WORKDIR /usr/src/app
#
#COPY package.json ./
#COPY ecosystem.config.js ./
#
#
#RUN npm set progress=false && \
#    npm config set depth 0 && \
#    npm install --only=production && \
#    npm install pm2 -g
#
#COPY --from=base /usr/src/app/build ./build
#
#
#CMD ["pm2-runtime", "ecosystem.config.js", "--env", "development"]
