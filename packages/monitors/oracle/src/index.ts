export { default as verify } from "./sanityCheck/verify";
export { default as setUpSdk } from "./setUpSdk";
export { default as verifyAndRepeat } from "./verifyAndRepeat";
export { updateOracleMonitorData } from "./controllers/index";

import { SupportedAsset } from "@midas-capital/types";
import { BigNumber } from "ethers";
import pino from "pino";

import { config } from "./config";

export enum InvalidReason {
  DEVIATION_ABOVE_THRESHOLD = "DEVIATION_ABOVE_THRESHOLD",
  TWAP_LIQUIDITY_LOW = "TWAP_LIQUIDITY_LOW",
  LAST_OBSERVATION_TOO_OLD = "LAST_OBSERVATION_TOO_OLD",
  UNKNOWN = "UNKNOWN",
}

export enum OracleFailure {
  MPO_FAILURE = "MPO_FAILURE",
}

export type PriceFeedInvalidity = {
  invalidReason: InvalidReason;
  message: string;
};

export type PriceValueInvalidity = {
  invalidReason: InvalidReason.DEVIATION_ABOVE_THRESHOLD;
  message: string;
};

export type SupportedAssetPriceFeed = {
  asset: SupportedAsset;
  mpoPrice: BigNumber;
  priceValidity: PriceValueInvalidity | null;
  feedValidity: PriceFeedInvalidity | null;
};

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
