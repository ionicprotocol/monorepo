import { FuseBase } from "../../Fuse";
import { SCALE_FACTOR_ONE_18_WEI } from "./utils";
import { BigNumber, utils } from "ethers";

export const minProfitEstimate = async (
  fuse: FuseBase,
  liquidationAmount: BigNumber,
  liquidationValueWei: BigNumber,
  outputPrice: BigNumber,
  seizeAmount: BigNumber,
  expectedGasFee: BigNumber
) => {
  // Get min seize
  const minEthSeizeAmountBreakEven = expectedGasFee.add(liquidationValueWei);
  const minEthSeizeAmount = minEthSeizeAmountBreakEven.add(
    BigNumber.from(utils.parseEther(process.env.MINIMUM_PROFIT_NATIVE!))
  );
  const minSeizeAmount = minEthSeizeAmount.mul(SCALE_FACTOR_ONE_18_WEI).div(outputPrice);

  // Check expected seize against minSeizeAmount
  if (seizeAmount.lt(minSeizeAmount)) {
    console.log(
      `Seize amount of ${utils.formatEther(seizeAmount)} less than min break even of ${minSeizeAmount}, doing nothing`
    );
    return null;
  }
};
