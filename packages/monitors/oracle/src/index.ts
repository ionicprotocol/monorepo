export { default as verify } from "./run";
export { default as setUpSdk } from "./setUpSdk";
export { default as verifyAndRepeat } from "./verifyAndRepeat";
export { updateOracleMonitorData } from "./controllers/index";

import pino from "pino";

import { config } from "./config";

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
