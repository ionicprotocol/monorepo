import Decimal from "decimal.js";
import { BigNumber, utils } from "ethers";

import { UniswapV3AssetConfig } from "./types";
import { priceToSqrtX96Price } from "./utils";

export const getPriceImpact = (target: Decimal, currentSqrtX96Price: Decimal) => {
  const diff = currentSqrtX96Price.sub(target);
  return diff.div(currentSqrtX96Price).mul(100);
};

export async function getTwapRatio(
  currPrice: BigNumber,
  currentSqrtX96Price: Decimal,
  tokenConfig: UniswapV3AssetConfig
): Promise<Decimal> {
  const { targetPriceImpact } = tokenConfig;

  const currPriceDecimal = new Decimal(utils.formatEther(currPrice.toString()));
  const targetTwapPump = currPriceDecimal.mul(targetPriceImpact.div(100).add(1));
  const targetTwapDump = currPriceDecimal.mul(new Decimal(1).sub(targetPriceImpact.div(100)));

  const targetRatioPump = getTwapTargetRatio(targetTwapPump, currPriceDecimal, currentSqrtX96Price, tokenConfig);
  const targetRatioDump = getTwapTargetRatio(targetTwapDump, currPriceDecimal, currentSqrtX96Price, tokenConfig);

  return Decimal.abs(targetRatioPump) > Decimal.abs(targetRatioDump)
    ? Decimal.abs(targetRatioDump)
    : Decimal.abs(targetRatioPump);
}

function getTwapTargetRatio(
  targetEthTwap: Decimal,
  currPrice: Decimal,
  currentSqrtX96Price: Decimal,
  tokenConfig: UniswapV3AssetConfig
): Decimal {
  const { attackBlocks, cardinality, inverted } = tokenConfig;
  if (currPrice.eq(0)) return new Decimal(0);
  let target = targetEthTwap;

  if (inverted) {
    target = Decimal.div(1, target);
    currPrice = Decimal.div(1, currPrice);
  }

  target = target
    .pow(cardinality)
    .div(currPrice.pow(cardinality - attackBlocks))
    .pow(Decimal.div(1, attackBlocks));
  const targetSqrtX96Price = priceToSqrtX96Price(target).add(2);
  return getPriceImpact(targetSqrtX96Price, currentSqrtX96Price);
}
