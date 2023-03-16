import { BigNumber, BigNumberish } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';

export const dynamicFormatter = (value: number, options: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat('en-US', options).format(value);

export const smallFormatter = (num: number, isCompacted?: boolean) => {
  return dynamicFormatter(num, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    notation: isCompacted ? 'compact' : undefined,
  });
};

export function tokenFormatter(value: BigNumber, decimals: BigNumberish = 18, symbol?: string) {
  return smallFormatter(Number(formatUnits(value, decimals)), true) + (symbol ? ` ${symbol}` : '');
}

export const smallUsdFormatter = (num: number, isCompacted?: boolean) => {
  return '$' + smallFormatter(num, isCompacted);
};
