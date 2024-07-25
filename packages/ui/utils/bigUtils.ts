import { formatUnits } from 'viem';

export const dynamicFormatter = (
  value: number,
  options: Intl.NumberFormatOptions
) => new Intl.NumberFormat('en-US', options).format(value);

export const smallFormatter = (
  num: number,
  isCompacted?: boolean,
  digits = 2
) => {
  return dynamicFormatter(num, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
    notation: isCompacted ? 'compact' : undefined
  });
};

export function tokenFormatter(value: bigint, decimals = 18, symbol?: string) {
  return (
    smallFormatter(Number(formatUnits(value, decimals)), true) +
    (symbol ? ` ${symbol}` : '')
  );
}

export const smallUsdFormatter = (num: number, isCompacted?: boolean) => {
  return '$' + smallFormatter(num, isCompacted);
};
