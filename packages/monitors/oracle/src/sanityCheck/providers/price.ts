import { MidasSdk } from "@midas-capital/sdk";
import { SupportedAsset, SupportedChains } from "@midas-capital/types";
import { BigNumber, utils } from "ethers";

import { InvalidReason, logger, PriceValueInvalidity } from "../../";
import { config } from "../../config";
import { getDefiLlamaPrice } from "../utils";

export interface VerifyPriceParams {
  midasSdk: MidasSdk;
  asset: SupportedAsset;
  mpoPrice: BigNumber;
}

export async function verifyPriceValue({
  midasSdk,
  asset,
  mpoPrice,
}: VerifyPriceParams): Promise<PriceValueInvalidity | null> {
  const chainName = SupportedChains[midasSdk.chainId];

  const wrappedNativeId = `${chainName}:${midasSdk.chainSpecificAddresses.W_TOKEN}`;
  const assetId = `${chainName}:${asset.underlying}`;
  const wrappedNativeTokenPriceUSD = await getDefiLlamaPrice(wrappedNativeId);
  const tokenPriceUSD = await getDefiLlamaPrice(assetId);

  const assetPriceUSD = parseFloat(utils.formatEther(mpoPrice)) * wrappedNativeTokenPriceUSD;
  const priceDiff = Math.abs(assetPriceUSD - tokenPriceUSD);
  const priceDiffPercent = (priceDiff / assetPriceUSD) * 100;
  logger.info(`Price difference for asset is ${priceDiffPercent}%`);

  if (priceDiffPercent > config.maxPriceDeviation) {
    return {
      message: `Price difference for asset is ${priceDiffPercent}%, larger than max allowed ${config.maxPriceDeviation}%`,
      invalidReason: InvalidReason.DEVIATION_ABOVE_THRESHOLD,
    };
  }
  return null;
}
