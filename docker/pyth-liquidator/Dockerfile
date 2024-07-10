# Use the Node.js 16 image as base
FROM node:16

# Set the working directory
WORKDIR /app

# Copy package.json and yarn.lock to install dependencies
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Set the command to run the TypeScript file using ts-node
CMD ["npx", "ts-node", "packages/bots/liquidator/src/runPythLiquidator.ts"]
