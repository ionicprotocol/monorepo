export { default as verifyPriceFeed } from "./verifyPriceFeed";
export { default as fetchAssetPrices } from "./fetchAssetPrices";
export { default as setUpSdk } from "./setUpSdk";
export { default as fetchPricesAndRepeat } from "./fetchPricesAndRepeat";
export { default as verifyOracleProviderPriceFeed } from "./verifyOracleProviderPriceFeed";
import { SupportedAsset } from "@midas-capital/sdk";
import { BigNumber } from "ethers";
import pino from "pino";

export type SupportedAssetPriceFeed = {
  asset: SupportedAsset;
  valid: boolean;
  price: BigNumber;
};

export const logger = pino({
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
});
