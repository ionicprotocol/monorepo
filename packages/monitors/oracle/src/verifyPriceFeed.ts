import { SupportedAsset, Fuse } from "@midas-capital/sdk";

import { logger } from "./index";

export default async function verifyPriceFeed(fuse: Fuse, asset: SupportedAsset) {
  logger.info(`Fetching price for ${asset.underlying} (${asset.symbol})`);
  const mpo = fuse.createMasterPriceOracle();
  const price = await mpo.callStatic.getUnderlyingPrice(asset.underlying);

  const underlyingOracleAddress = await mpo.oracles(asset.underlying);
  const underlyingOracle = await fuse.createOracle(underlyingOracleAddress, asset.oracle);
  const underlyingOraclePrice = await underlyingOracle.callStatic.price();
  if (price !== underlyingOraclePrice) {
    throw "Oracle prices out of sync";
  }
  return price;
}
