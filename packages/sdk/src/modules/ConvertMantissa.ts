import { formatUnits } from "viem";

import { IonicBaseConstructor } from "..";

const daysPerYear = 365;

export interface IConvertMantissa {
  ratePerBlockToAPY(ratePerBlock: bigint, blocksPerMin: number): number;
}

export function withConvertMantissa<TBase extends IonicBaseConstructor>(
  Base: TBase
): {
  new (...args: any[]): IConvertMantissa;
} & TBase {
  return class ConvertMantissa extends Base {
    /**
     * Directly taken from the compound.finance docs:
     * https://compound.finance/docs#protocol-math
     */
    ratePerBlockToAPY(ratePerBlock: bigint, blocksPerMin: number): number {
      const blocksPerDay = blocksPerMin * 60 * 24;
      const rateAsNumber = Number(formatUnits(ratePerBlock, 18));
      return (Math.pow(rateAsNumber * blocksPerDay + 1, daysPerYear) - 1) * 100;
    }
  };
}
