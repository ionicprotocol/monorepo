import { BigNumber, utils } from "ethers";

import { FuseBaseConstructor } from "../types";

export function withConvertMantissa<TBase extends FuseBaseConstructor>(Base: TBase) {
  return class ConvertMantissa extends Base {
    convertMantissaToAPY(mantissa: BigNumber, blocksPerMin: number, dayRange = 365) {
      return (Math.pow(Number(utils.formatUnits(mantissa)) * blocksPerMin * 60 * 24 + 1, dayRange) - 1) * 100;
    }

    convertMantissaToAPR(mantissa: BigNumber, blocksPerMin: number) {
      return Number(utils.formatUnits(mantissa)) * blocksPerMin * 60 * 24 * 365 * 100;
    }
  };
}
