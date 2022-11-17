import { ERC20Abi, MidasSdk } from "@midas-capital/sdk";
import { SupportedChains } from "@midas-capital/types";
import { BigNumber, Contract, utils } from "ethers";

import { UniswapV3AssetConfig } from "../../../types";
import { getDefiLlamaPrice } from "../../../utils";
import { getTokenPrices } from "../utils";

import { V3Fetcher } from "./fetcher";

async function getUniV3BalanceAndDecimals(sdk: MidasSdk, token: UniswapV3AssetConfig) {
  const fetcher = new V3Fetcher(sdk);
  const { token0, token1, fee } = token;

  const token0Erc20 = new Contract(token0, ERC20Abi, sdk.provider);
  const token1Erc20 = new Contract(token0, ERC20Abi, sdk.provider);

  const pool = await fetcher.computeUniV3PoolAddress(token0, token1, fee);

  const token0balance = await token0Erc20.callStatic.balanceOf(pool);
  const token1balance = await token1Erc20.callStatic.balanceOf(pool);

  const token0decimals = await token0Erc20.callStatic.decimals();
  const token1decimals = await token1Erc20.callStatic.decimals();

  return { token0balance, token1balance, token0decimals, token1decimals };
}

export async function getPoolTVL(sdk: MidasSdk, token: UniswapV3AssetConfig) {
  const { token0balance, token1balance, token0decimals, token1decimals } = await getUniV3BalanceAndDecimals(sdk, token);
  const { token0price, token1price } = await getTokenPrices(sdk, token);

  const chainName = SupportedChains[sdk.chainId];

  const wrappedNativeId = `${chainName}:${sdk.chainSpecificAddresses.W_TOKEN}`;
  const wrappedNativeTokenPriceUSD = await getDefiLlamaPrice(wrappedNativeId);
  if (!wrappedNativeTokenPriceUSD) {
    throw new Error(`No price found for ${wrappedNativeId}`);
  }

  const token0Value = token0balance.mul(token0price).div(BigNumber.from(10).pow(token0decimals));
  const token1Value = token1balance.mul(token1price).div(BigNumber.from(10).pow(token1decimals));

  const totalValueInWrappedNative = token0Value.add(token1Value);
  return parseFloat(utils.formatEther(totalValueInWrappedNative)) * wrappedNativeTokenPriceUSD;
}
