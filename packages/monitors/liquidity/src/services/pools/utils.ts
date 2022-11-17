import { MidasSdk } from "@midas-capital/sdk";
import { BigNumber } from "ethers";

import { UniswapV2AssetConfig, UniswapV3AssetConfig } from "../../types";

export async function getTokenPrices(
  sdk: MidasSdk,
  token: UniswapV3AssetConfig | UniswapV2AssetConfig
): Promise<{ token0price: BigNumber; token1price: BigNumber }> {
  const mpo = sdk.createMasterPriceOracle();
  const token0price = await mpo.callStatic.price(token.token0);
  const token1price = await mpo.callStatic.price(token.token1);
  return { token0price, token1price };
}
