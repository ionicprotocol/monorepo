export { default as setUpSdk } from "./setUpSdk";
export { updateOracleMonitorData } from "./controllers/index";

export { runVerifier } from "./run";

import pino from "pino";

import { getConfig } from "./config";

export const logger = pino({
  level: getConfig().logLevel,
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: "yyyy-dd-mm, h:MM:ss TT",
    },
  },
});
