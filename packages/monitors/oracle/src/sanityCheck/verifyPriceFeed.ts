import { MidasSdk } from "@midas-capital/sdk";
import { OracleTypes, SupportedAsset } from "@midas-capital/types";
import { BigNumber, ethers, utils } from "ethers";

import { InvalidFeedExtraData, InvalidReason, logger, SupportedAssetPriceFeed } from "../index";

import {
  getMpoPrice,
  verifyChainLinkOraclePriceFeed,
  verifyDiaOraclePriceFeed,
  verifyFluxOraclePriceFeed,
  verifyUniswapV2PriceFeed,
} from ".";

export default async function verifyPriceFeed(
  midasSdk: MidasSdk,
  asset: SupportedAsset
): Promise<SupportedAssetPriceFeed> {
  const oracle = asset.oracle;
  if (!oracle) {
    logger.warn(`No oracle for asset ${asset.symbol}`);
    return {
      asset,
      valid: true,
      invalidReason: null,
      extraInfo: null,
      priceBN: BigNumber.from(1),
      priceEther: 1,
    };
  }
  const { mpoPrice, underlyingOracleAddress } = await getMpoPrice(midasSdk, asset);
  if (mpoPrice.isZero()) {
    return {
      asset,
      valid: false,
      invalidReason: InvalidReason.MPO_FAILURE,
      extraInfo: {
        message: "Failed to fetch price from Master Price Oracle",
        extraData: {},
      },
      priceBN: BigNumber.from(0),
      priceEther: 0,
    };
  }

  let valid: boolean;
  let invalidReason: InvalidReason | null;
  let extraInfo: InvalidFeedExtraData | null;

  switch (oracle) {
    case OracleTypes.ChainlinkPriceOracleV2:
      ({ valid, invalidReason, extraInfo } = await verifyChainLinkOraclePriceFeed(
        midasSdk.provider,
        midasSdk.oracles,
        asset.underlying
      ));
      break;
    case OracleTypes.DiaPriceOracle:
      ({ valid, invalidReason, extraInfo } = await verifyDiaOraclePriceFeed(
        midasSdk.provider,
        midasSdk.oracles,
        asset.underlying
      ));
      break;
    case OracleTypes.FluxPriceOracle:
      ({ valid, invalidReason, extraInfo } = await verifyFluxOraclePriceFeed(midasSdk.oracles, asset.underlying));
      break;
    case OracleTypes.UniswapTwapPriceOracleV2:
      ({ valid, invalidReason, extraInfo } = await verifyUniswapV2PriceFeed(
        midasSdk,
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
