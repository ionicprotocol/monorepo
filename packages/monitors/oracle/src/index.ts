export { default as setUpSdk } from "./setUpSdk";
export { updateOracleMonitorData } from "./controllers/index";

export { runVerifiers } from "./run";

import pino from "pino";

import { baseConfig } from "./config/variables";

export const logger = pino({
  level: baseConfig.logLevel,
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: "yyyy-dd-mm, h:MM:ss TT",
    },
  },
});
