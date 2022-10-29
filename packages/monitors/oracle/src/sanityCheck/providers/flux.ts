import { OracleConfig } from "@midas-capital/types";

import { SupportedAssetPriceValidity } from "../../";

export async function verifyFluxOraclePriceFeed(
  oracleConfig: OracleConfig,
  underlying: string
): Promise<SupportedAssetPriceValidity> {
  console.log(oracleConfig, underlying);
  return { valid: true, extraInfo: null, invalidReason: null };
}
