export { default as setUpSdk } from "./setUpSdk";

export { runVerifiers } from "./run";

import pino from "pino";

import { baseConfig } from "./config/variables";

export const logger = pino({
  level: baseConfig.logLevel,
  transport: {
    target: "pino-pretty",
    options: {
      colorize: baseConfig.environment === "development" ? true : false,
      levelFirst: true,
      translateTime: "yyyy-dd-mm, h:MM:ss TT",
    },
  },
});
