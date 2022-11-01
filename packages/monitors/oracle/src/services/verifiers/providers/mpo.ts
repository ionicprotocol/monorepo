import { MidasSdk } from "@midas-capital/sdk";
import { SupportedAsset } from "@midas-capital/types";
import { BigNumber, Wallet } from "ethers";

import { logger } from "../../..";
import { getConfig } from "../../../config";
import { DiscordService } from "../../discord";

export const getMpoPrice = async (
  midasSdk: MidasSdk,
  asset: SupportedAsset
): Promise<{ mpoPrice: BigNumber; underlyingOracleAddress: string }> => {
  logger.info(`Fetching price for ${asset.underlying} (${asset.symbol})`);

  const config = getConfig();
  const signer = new Wallet(config.adminPrivateKey, midasSdk.provider);
  const mpo = midasSdk.createMasterPriceOracle(signer);

  try {
    const mpoPrice = await mpo.callStatic.price(asset.underlying);
    const underlyingOracleAddress = await mpo.callStatic.oracles(asset.underlying);
    return { mpoPrice, underlyingOracleAddress };
  } catch (e) {
    const msg = `Failed to fetch price for ${asset.underlying} (${asset.symbol})`;

    const alert = new DiscordService(asset, midasSdk.chainId);
    await alert.sendMpoFailureAlert(msg);

    logger.error(msg);
    return { mpoPrice: BigNumber.from(0), underlyingOracleAddress: "" };
  }
};
