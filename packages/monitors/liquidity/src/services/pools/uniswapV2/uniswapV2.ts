import { MidasSdk } from "@midas-capital/sdk";
import { SupportedChains } from "@midas-capital/types";
import { BigNumber, utils } from "ethers";

import { logger } from "../../..";
import { getDefiLlamaPrice } from "../../../utils";
import { getTokenPrices } from "../utils";

import { Reserves } from "./fetcher";

export async function getPoolTVL(sdk: MidasSdk, reserves: Reserves) {
  const { token0price, token1price } = await getTokenPrices(sdk, {
    token0: reserves.r0.underlying.address,
    token1: reserves.r1.underlying.address,
  });

  const chainName = SupportedChains[sdk.chainId];
  const wrappedNativeId = `${chainName}:${sdk.chainSpecificAddresses.W_TOKEN}`;

  const wrappedNativeTokenPriceUSD = await getDefiLlamaPrice(wrappedNativeId);

  if (!wrappedNativeTokenPriceUSD) {
    throw new Error(`No price found for ${wrappedNativeId}`);
  }

  const r0decimals = await reserves.r0.underlying.callStatic.decimals();
  const r1decimals = await reserves.r1.underlying.callStatic.decimals();

  const r0reserves = token0price.mul(reserves.r0.reserves).div(BigNumber.from(10).pow(r0decimals));
  const r1reserves = token1price.mul(reserves.r1.reserves).div(BigNumber.from(10).pow(r1decimals));

  const totalReservesUsd = parseFloat(utils.formatEther(r0reserves.add(r1reserves))) * wrappedNativeTokenPriceUSD;
  logger.info(`Pair is operating with $${totalReservesUsd} of liquidity`);
  return totalReservesUsd;
}
