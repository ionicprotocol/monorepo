export { default as approveTokensToSafeLiquidator } from "./utils/approveTokensToSafeLiquidator";

export { default as liquidateAndRepeat } from "./liquidateAndRepeat";

export { default as config } from "./config";

import pino from "pino";

import config from "./config";

export const logger = pino({
  level: config.logLevel,
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: "yyyy-dd-mm, h:MM:ss TT",
    },
  },
});
