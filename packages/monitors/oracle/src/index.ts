export { default as verifyPriceFeed } from "./verifyPriceFeed";
export { default as fetchAssetPrices } from "./fetchAssetPrices";
export { default as setUpSdk } from "./setUpSdk";
export { default as fetchPricesAndRepeat } from "./fetchPricesAndRepeat";
import pino from "pino";

export const logger = pino({
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
});
