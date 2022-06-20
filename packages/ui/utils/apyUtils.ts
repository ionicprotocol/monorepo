import { BigNumber } from 'ethers';

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
