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
