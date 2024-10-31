import { formatUnits } from "viem";

import { IonicBaseConstructor } from "..";

const daysPerYear = 365;

export interface IConvertMantissa {
  ratePerBlockToAPY(ratePerBlock: bigint, blocksPerMin: number): number;
  apyToRatePerBlock(apy: number, blocksPerMin: number): bigint;
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
      console.log("🚀 ~ ConvertMantissa ~ ratePerBlockToAPY ~ ratePerBlock:", ratePerBlock);
      console.log("🚀 ~ ConvertMantissa ~ ratePerBlockToAPY ~ rateAsNumber:", rateAsNumber);
      console.log("🚀 ~ ConvertMantissa ~ ratePerBlockToAPY ~ blocksPerDay:", blocksPerDay);
      console.log("🚀 ~ ConvertMantissa ~ ratePerBlockToAPY ~ daysPerYear:", daysPerYear);
      console.log(
        "🚀 ~ ConvertMantissa ~ ratePerBlockToAPY ~ (Math.pow(rateAsNumber * blocksPerDay + 1, daysPerYear) - 1) * 100:",
        (Math.pow(rateAsNumber * blocksPerDay + 1, daysPerYear) - 1) * 100
      );
      return (Math.pow(rateAsNumber * blocksPerDay + 1, daysPerYear) - 1) * 100;
    }

    /**
     * Converts APY to rate per block
     * Inverse of the compound.finance rate calculation
     * @param apy Annual Percentage Yield (as a percentage, e.g., 5 for 5%)
     * @param blocksPerMin Number of blocks per minute
     * @returns Rate per block as a bigint with 18 decimals of precision
     */
    apyToRatePerBlock(apy: number, blocksPerMin: number): bigint {
      const blocksPerDay = blocksPerMin * 60 * 24;
      const dailyRate = Math.pow(apy / 100 + 1, 1 / daysPerYear) - 1;
      const ratePerBlock = dailyRate / blocksPerDay;

      // Convert to bigint with 18 decimals of precision
      return BigInt(Math.floor(ratePerBlock * 1e18));
    }
  };
}
