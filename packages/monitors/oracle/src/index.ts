export { default as verifyPriceFeed } from "./verifyPriceFeed";
export { default as verify } from "./verify";
export { default as setUpSdk } from "./setUpSdk";
export { default as verifyAndRepeat } from "./verifyAndRepeat";
export { default as verifyOracleProviderPriceFeed } from "./verifyOracleProviderPriceFeed";
export { default as verifyTwapPriceFeed } from "./verifyTwapPriceFeed";
export { updateOracleMonitorData } from "./controllers/index";

export { getCgPrice } from "./utils";
import { SupportedAsset } from "@midas-capital/sdk";
import { BigNumber } from "ethers";
import pino from "pino";

export enum InvalidReason {
  DEVIATION_ABOVE_THRESHOLD = "DEVIATION_ABOVE_THRESHOLD",
  TWAP_LIQUIDITY_LOW = "TWAP_LIQUIDITY_LOW",
  LAST_OBSERVATION_TOO_OLD = "LAST_OBSERVATION_TOO_OLD",
  UNKNOWN = "UNKNOWN",
}

export type InvalidFeedExtraData = {
  message: string;
  extraData: {
    timeSinceLastUpdate?: number;
    workablePair?: boolean;
    twapDepthUSD?: number;
  };
};

export type SupportedAssetPriceValidity = {
  valid: boolean;
  invalidReason: InvalidReason | null;
  extraInfo: InvalidFeedExtraData | null;
};

export type SupportedAssetPriceFeed = SupportedAssetPriceValidity & {
  asset: SupportedAsset;
  priceBN: BigNumber;
  priceEther: number;
};

export const logger = pino({
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
});
