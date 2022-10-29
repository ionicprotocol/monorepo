import { MidasSdk } from "@midas-capital/sdk";
import { SupportedAsset, SupportedChains } from "@midas-capital/types";
import { BigNumber, utils } from "ethers";

import { config } from "../config";
import { DiscordAlert } from "../controllers";
import { logger } from "../index";

import { getDefiLlamaPrice } from "./utils";

export async function verifyPriceValue(midasSdk: MidasSdk, asset: SupportedAsset, price: BigNumber) {
  const chainName = SupportedChains[midasSdk.chainId];

  const wrappedNativeId = `${chainName}:${midasSdk.chainSpecificAddresses.W_TOKEN}`;
  const assetId = `${chainName}:${asset.underlying}`;
  const wrappedNativeTokenPriceUSD = await getDefiLlamaPrice(wrappedNativeId);
  const tokenPriceUSD = await getDefiLlamaPrice(assetId);

  const assetPriceUSD = parseFloat(utils.formatEther(price)) * wrappedNativeTokenPriceUSD;
  const priceDiff = Math.abs(assetPriceUSD - tokenPriceUSD);
  const priceDiffPercent = (priceDiff / assetPriceUSD) * 100;
  logger.info(`Price difference for asset is ${priceDiffPercent}%`);

  if (priceDiffPercent > config.maxPriceDeviation) {
    const msg = `Price difference for asset is ${priceDiffPercent}%, larger than max allowed ${config.maxPriceDeviation}%`;

    const alert = new DiscordAlert(asset, midasSdk.chainId);
    await alert.sendInvalidPriceAlert(msg);

    logger.error(msg);
    return { mpoPrice: BigNumber.from(0), underlyingOracleAddress: "" };
  }
}
