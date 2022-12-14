import { MidasSdk } from "@midas-capital/sdk";
import { SupportedChains } from "@midas-capital/types";
import { BigNumber, utils } from "ethers";

import { logger } from "../..";
import { Reserve } from "../../types";
import { getDefiLlamaPrice } from "../../utils";

export async function getTokenPrices(sdk: MidasSdk, tokens: string[]): Promise<BigNumber[]> {
  const mpo = sdk.createMasterPriceOracle();
  const promises = tokens.map((token) => mpo.callStatic.getUnderlyingPrice(token));
  const prices = await Promise.all(promises);
  return prices;
}

export async function getPoolTVL(sdk: MidasSdk, reserves: Reserve[]): Promise<number> {
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
