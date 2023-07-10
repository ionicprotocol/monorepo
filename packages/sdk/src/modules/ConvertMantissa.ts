import { BigNumber, utils } from "ethers";

import { IonicBaseConstructor } from "..";

const daysPerYear = 365;
export function withConvertMantissa<TBase extends IonicBaseConstructor>(Base: TBase) {
  return class ConvertMantissa extends Base {
    /**
     * Directly taken from the compound.finance docs:
     * https://compound.finance/docs#protocol-math
     */
    ratePerBlockToAPY(ratePerBlock: BigNumber, blocksPerMin: number): number {
      const blocksPerDay = blocksPerMin * 60 * 24;
      const rateAsNumber = Number(utils.formatUnits(ratePerBlock, 18));
      return (Math.pow(rateAsNumber * blocksPerDay + 1, daysPerYear) - 1) * 100;
    }
  };
}
