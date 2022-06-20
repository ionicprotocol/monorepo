import { BigNumber, utils } from 'ethers';

export const convertMantissaToAPY = (
  mantissa: BigNumber,
  blocksPerMin: number,
  dayRange: number
) => {
  return (
    (Math.pow(Number(utils.formatUnits(mantissa)) * blocksPerMin * 60 * 24 + 1, dayRange) - 1) * 100
  );
};

export const convertMantissaToAPR = (mantissa: BigNumber, blocksPerMin: number) => {
  return Number(utils.formatUnits(mantissa)) * blocksPerMin * 60 * 24 * 365 * 100;
};

//
/**
 * Directly taken from the compound.finance docs:
 * https://compound.finance/docs#protocol-math
 */
const ethMantissa = 1e18;
const daysPerYear = 365;
export const ratePerBlockToAPY = (ratePerBlock: BigNumber, blocksPerMin: number) => {
  const blocksPerDay = blocksPerMin * 60 * 24;
  return (Math.pow((ratePerBlock / ethMantissa) * blocksPerDay + 1, daysPerYear) - 1) * 100;
};
