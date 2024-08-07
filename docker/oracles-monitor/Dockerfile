FROM public.ecr.aws/lambda/nodejs:20 as node

FROM node as build

RUN dnf update -y 
RUN dnf install -y git 

RUN corepack enable
RUN yarn set version stable

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
COPY packages/types/package.json /tmp/build/packages/types/
COPY packages/chains/package.json /tmp/build/packages/chains/
COPY packages/monitors/oracle/package.json /tmp/build/packages/monitors/oracle/
COPY yarn.lock /tmp/build/

# ----- Install dependencies -----
# Install dependencies exactly as in the yarn.lock file - no updates.
RUN yarn install --inline-builds --mode=skip-build
# RUN yarn install

# ----- Copy source and all other files that affect lint, test, build -----
COPY packages/sdk /tmp/build/packages/sdk
COPY packages/types /tmp/build/packages/types
COPY packages/chains /tmp/build/packages/chains
COPY packages/monitors/oracle /tmp/build/packages/monitors/oracle

# # ----- build -----
RUN yarn build:deploy:oracles-monitor

# ----------------------------------------
# Copy files to the deployment image.
# ----------------------------------------

FROM node as runtime

ENV NODE_ENV=production

# ----- Copy files required at runtime by the app -----
WORKDIR ${LAMBDA_TASK_ROOT}
COPY --from=build /tmp/build ${LAMBDA_TASK_ROOT}

CMD ["packages/monitors/oracle/build/monitors/oracle/src/index.handler"]

