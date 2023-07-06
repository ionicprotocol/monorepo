import { MidasSdk } from "@ionicprotocol/sdk";
import { SupportedChains } from "@ionicprotocol/types";
import { BigNumber, utils } from "ethers";

import { logger } from "../../..";
import { Reserve } from "../../../types";
import { getDefiLlamaPrice } from "../../../utils";
import { getTokenPrices } from "../utils";

export async function getPoolTVL(sdk: MidasSdk, reserves: Reserve[]) {
  const tokenPrices = await getTokenPrices(
    sdk,
    reserves.map((r) => r.underlying.address)
  );

  const tokenDecimals = await Promise.all(reserves.map((r) => r.underlying.callStatic.decimals()));
  const tokenReserves = reserves.map((r, i) =>
    tokenPrices[i].mul(r.reserves).div(BigNumber.from(10).pow(tokenDecimals[i]))
  );

  const totalReserves = parseFloat(utils.formatEther(tokenReserves.reduce((a, b) => a.add(b))));

  const chainName = SupportedChains[sdk.chainId];
  const wrappedNativeId = `${chainName}:${sdk.chainSpecificAddresses.W_TOKEN}`;

  const wrappedNativeTokenPriceUSD = await getDefiLlamaPrice(wrappedNativeId);

  if (!wrappedNativeTokenPriceUSD) {
    throw new Error(`No price found for ${wrappedNativeId}`);
  }

  const totalReservesUsd = totalReserves * wrappedNativeTokenPriceUSD;
  logger.info(`Pair is operating with $${totalReservesUsd} of liquidity`);
  return totalReservesUsd;
}
