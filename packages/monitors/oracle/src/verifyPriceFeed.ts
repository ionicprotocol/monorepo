import { Fuse, OracleTypes, SupportedAsset } from "@midas-capital/sdk";
import { BigNumber, ethers, utils, Wallet } from "ethers";

import { config } from "./config";

import {
  InvalidFeedExtraData,
  InvalidReason,
  logger,
  SupportedAssetPriceFeed,
  verifyOracleProviderPriceFeed,
  verifyTwapPriceFeed,
} from "./index";

export default async function verifyPriceFeed(fuse: Fuse, asset: SupportedAsset): Promise<SupportedAssetPriceFeed> {
  const oracle = asset.oracle;
  if (!oracle) {
    return {
      asset,
      valid: true,
      invalidReason: null,
      extraInfo: null,
      priceBN: BigNumber.from(1),
      priceEther: 1,
    };
  }
  const signer = new Wallet(config.adminPrivateKey, fuse.provider);

  logger.info(`Fetching price for ${asset.underlying} (${asset.symbol})`);
  const mpo = fuse.createMasterPriceOracle(signer);
  const mpoPrice = await mpo.callStatic.price(asset.underlying);
  const underlyingOracleAddress = await mpo.callStatic.oracles(asset.underlying);

  let valid: boolean;
  let invalidReason: InvalidReason | null;
  let extraInfo: InvalidFeedExtraData | null;

  switch (oracle) {
    case OracleTypes.ChainlinkPriceOracleV2:
      ({ valid, invalidReason, extraInfo } = await verifyOracleProviderPriceFeed(fuse, oracle, asset.underlying));
      break;
    case OracleTypes.DiaPriceOracle:
      ({ valid, invalidReason, extraInfo } = await verifyOracleProviderPriceFeed(fuse, oracle, asset.underlying));
      break;
    case OracleTypes.FluxPriceOracle:
      ({ valid, invalidReason, extraInfo } = await verifyOracleProviderPriceFeed(fuse, oracle, asset.underlying));
      break;
    case OracleTypes.UniswapTwapPriceOracleV2:
      ({ valid, invalidReason, extraInfo } = await verifyTwapPriceFeed(
        fuse,
        underlyingOracleAddress,
        asset.underlying
      ));
      break;
    case OracleTypes.FixedNativePriceOracle:
      if (!mpoPrice.eq(ethers.utils.parseEther("1"))) {
        valid = false;
        invalidReason = extraInfo = null;
      } else {
        valid = true;
        invalidReason = extraInfo = null;
      }
      break;
    default:
      valid = true;
      invalidReason = extraInfo = null;
      break;
  }
  return {
    asset,
    valid,
    priceBN: mpoPrice,
    priceEther: parseFloat(utils.formatEther(mpoPrice)),
    invalidReason,
    extraInfo,
  };
}
