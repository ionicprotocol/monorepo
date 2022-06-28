import { Fuse, OracleTypes, SupportedAsset } from "@midas-capital/sdk";
import { ethers } from "ethers";

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
  switch (asset.oracle) {
    case OracleTypes.ChainlinkPriceOracleV2:
    case OracleTypes.DiaPriceOracle:
    case OracleTypes.FluxPriceOracle:
      await verifyOracleProviderPriceFeed(fuse, asset);
      break;
    case OracleTypes.UniswapTwapPriceOracleV2:
      await verifyTwapPriceFeed(fuse, asset);
      break;
    case OracleTypes.FixedNativePriceOracle:
      if (!price.eq(ethers.utils.parseEther("1"))) {
        throw "For fixed native PO, price must equal 1 NATIVE";
      }
      break;
    default:
      break;
  }
}

async function verifyOracleProviderPriceFeed(fuse: Fuse, asset: SupportedAsset) {
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

async function verifyTwapPriceFeed(fuse: Fuse, asset: SupportedAsset) {
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
