import { BigNumber, utils } from "ethers";

import { c1e18, MAX_TICK_PRICE, WETH_ADDRESS } from "./constants";

export const sqrtPriceX96ToPrice = (a: BigNumber, invert: boolean): BigNumber => {
  const scale = BigNumber.from(2)
    .pow(96 * 2)
    .div(c1e18);

  a = a.mul(a).div(scale);

  if (invert && a.eq(0)) return BigNumber.from(MAX_TICK_PRICE.toFixed(0)).mul(c1e18);
  if (invert) a = c1e18.mul(c1e18).div(a);

  return BigNumber.from(a.toString());
};

export const formatPrice = (price: BigNumber, token: { address: string; decimals: number }): string => {
  return utils.formatEther(BigNumber.from(price).div(BigNumber.from(10).pow(18 - token.decimals)));
};

export const isInverted = (address: string) => BigNumber.from(address).gt(WETH_ADDRESS);

export const div = (a: number, b: number, positions = 18) => {
  const factor = Math.pow(10, positions);
  return (parseFloat(a.toFixed(positions)) * factor) / (parseFloat(b.toFixed(positions)) * factor);
};
