import Decimal from "decimal.js";
import { BigNumber, utils } from "ethers";

import { c1e18, MAX_TICK_PRICE } from "./constants";

Decimal.set({ precision: 50 });

export const sqrtPriceX96ToPrice = (a: BigNumber, invert: boolean): BigNumber => {
  const scale = new Decimal(2).pow(96 * 2).div(new Decimal(10).pow(18));
  const decimal = new Decimal(a.toString());
  const scaled = decimal.mul(decimal).div(scale);

  if (invert && scaled.eq(0)) return BigNumber.from(MAX_TICK_PRICE.toFixed(0)).mul(c1e18);

  if (invert) {
    const inverted = new Decimal(10).pow(18).mul(new Decimal(10).pow(18)).div(scaled);
    return BigNumber.from(inverted.toFixed(0));
  }

  return BigNumber.from(scaled.toFixed(0));
};

// a is decimal
export const priceToSqrtX96Price = (a: Decimal) => {
  return a
    .mul(Decimal.pow(2, 2 * 96))
    .sqrt()
    .floor();
};

export const formatPrice = (price: BigNumber, token: { address: string; decimals: number }): string => {
  return utils.formatEther(BigNumber.from(price).div(BigNumber.from(10).pow(18 - token.decimals)));
};

export const isInverted = (address: string, wNativeAddress: string) => BigNumber.from(address).gt(wNativeAddress);
