import { SupportedChains } from "@midas-capital/types";
import { Contract, utils } from "ethers";

import { FeedVerifierConfig, InvalidReason, PriceFeedValidity, VerifyFeedParams } from "../../../../types";
import { getDefiLlamaPrice } from "../../../../utils";

export async function verifyFluxOraclePriceFeed(
  { midasSdk, underlyingOracle, asset }: VerifyFeedParams,
  config: FeedVerifierConfig
): Promise<PriceFeedValidity> {
  const { feed, key } = await underlyingOracle.callStatic.priceFeeds(asset.underlying);
  const diaFeed = new Contract(
    feed,
    ["function getValue(string memory key) external view returns (uint128, uint128)"],
    midasSdk.provider
  );
  const [price, timestamp] = await diaFeed.callStatic.getValue(key);
  const updatedAtts = timestamp.toNumber();
  const timeSinceLastUpdate = Math.floor(Date.now() / 1000) - updatedAtts;

  if (timeSinceLastUpdate < config.defaultMaxObservationDelay) {
    return true;
  } else {
    const chainName = SupportedChains[midasSdk.chainId];

    const assetId = `${chainName}:${asset.underlying}`;
    const tokenPriceUSD = await getDefiLlamaPrice(assetId);
    if (tokenPriceUSD === null) {
      return {
        message: `Failed to fetch price for ${chainName}:${asset.underlying}`,
        invalidReason: InvalidReason.DEFI_LLAMA_API_ERROR,
      };
    }

    // DIA price feeds have 8 decimals
    // Assume also price feeds are USD-based
    const assetPriceUSD = parseFloat(utils.formatUnits(price, 8));
    const priceDiff = Math.abs(assetPriceUSD - tokenPriceUSD);
    const priceDiffPercent = priceDiff / assetPriceUSD;

    if (priceDiffPercent > 0.01) {
      return {
        invalidReason: InvalidReason.LAST_OBSERVATION_TOO_OLD,
        message: `Last updated happened ${timeSinceLastUpdate} seconds ago, more than than the max delay of ${config.maxObservationDelay} & deviation is > 1%`,
      };
    }
    return true;
  }
}
