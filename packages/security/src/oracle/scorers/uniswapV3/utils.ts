import Decimal from "decimal.js";
import { formatEther } from "viem";

import { c1e18, MAX_TICK_PRICE } from "./constants";

Decimal.set({ precision: 50 });

export const sqrtPriceX96ToPrice = (a: bigint, invert: boolean): bigint => {
  const scale = new Decimal(2).pow(96 * 2).div(new Decimal(10).pow(18));
  const decimal = new Decimal(a.toString());
  const scaled = decimal.mul(decimal).div(scale);

  if (invert && scaled.eq(0)) return BigInt(MAX_TICK_PRICE.toFixed(0)) * c1e18;

  if (invert) {
    const inverted = new Decimal(10).pow(18).mul(new Decimal(10).pow(18)).div(scaled);
    return BigInt(inverted.toFixed(0));
  }

  return BigInt(scaled.toFixed(0));
};

// a is decimal
export const priceToSqrtX96Price = (a: Decimal) => {
  return a
    .mul(Decimal.pow(2, 2 * 96))
    .sqrt()
    .floor();
};

export const formatPrice = (price: bigint, token: { address: string; decimals: number }): string => {
  return formatEther(price / 10n ** (18n - BigInt(token.decimals)));
};

export const isInverted = (address: string, wNativeAddress: string) => address > wNativeAddress;
