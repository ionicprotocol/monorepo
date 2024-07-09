# Use the Lambda Node.js 20 image as base
FROM public.ecr.aws/lambda/nodejs:20 as node

# Set environment variables and install dependencies
ENV NODE_ENV=production

# Copy necessary files from the build stage
WORKDIR ${LAMBDA_TASK_ROOT}

# ----- Copy only the files that affect yarn install -----
# Allows docker to use cache and skip install if dependencies are unchanged.
# Assumes that ./packages/*/package.json files have been copied to TEMP_DEPS_DIR
# with that same directory structure. build.sh does this.
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

# Use another node stage for runtime
FROM node as runtime

ENV NODE_ENV=production

# Copy necessary files from the build stage
WORKDIR ${LAMBDA_TASK_ROOT}
COPY --from=node /tmp/build ${LAMBDA_TASK_ROOT}

# Set the command to run the TypeScript file using ts-node
CMD ["npx", "ts-node", "packages/bots/liquidator/src/runPythLiquidator.ts"]