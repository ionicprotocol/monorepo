import { SupportedChains } from "@midas-capital/types";
import { utils } from "ethers";

import { logger } from "../../../../logger";
import { InvalidReason, PriceFeedValidity, VerifyPriceParams } from "../../../../types";
import { getDefiLlamaPrice } from "../../../../utils";

export async function verifyPriceValue({ midasSdk, asset, mpoPrice }: VerifyPriceParams): Promise<PriceFeedValidity> {
  const chainName = SupportedChains[midasSdk.chainId];

  const wrappedNativeId = `${chainName}:${midasSdk.chainSpecificAddresses.W_TOKEN}`;
  const assetId = `${chainName}:${asset.underlying}`;
  const wrappedNativeTokenPriceUSD = await getDefiLlamaPrice(wrappedNativeId);
  const tokenPriceUSD = await getDefiLlamaPrice(assetId);
  if (wrappedNativeTokenPriceUSD === null || tokenPriceUSD === null) {
    return {
      message: `Failed to fetch price for ${asset.symbol} (${asset.underlying})`,
      invalidReason: InvalidReason.DEFI_LLAMA_API_ERROR,
    };
  }

  const assetPriceUSD = parseFloat(utils.formatEther(mpoPrice)) * wrappedNativeTokenPriceUSD;
  const priceDiff = Math.abs(assetPriceUSD - tokenPriceUSD);
  const priceDiffPercent = (priceDiff / assetPriceUSD) * 100;
  logger.info(`Price difference for asset is ${priceDiffPercent}%`);

  if (priceDiffPercent > asset.maxPriceDeviation) {
    return {
      message: `Price difference for asset is ${priceDiffPercent}%, larger than max allowed ${asset.maxPriceDeviation}%`,
      invalidReason: InvalidReason.DEVIATION_ABOVE_THRESHOLD,
    };
  }
  return true;
}
