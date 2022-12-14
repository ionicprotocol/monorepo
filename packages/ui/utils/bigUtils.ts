import { BigNumber, BigNumberish } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';

const formatter = Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 5,
  maximumFractionDigits: 5,
});

export const smallFormatter = Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const smallUSDFormatter = Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const shortFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  notation: 'compact',
});

const midFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  notation: 'compact',
});

const longFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 18,
});

export const dynamicFormatter = (value: number, options: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat('en-US', options).format(value);

export function smallStringUsdFormatter(num: string | number) {
  return smallUSDFormatter.format(parseFloat(num.toString()));
}

export function stringUsdFormatter(num: string) {
  return formatter.format(parseFloat(num));
}

export function smallUsdFormatter(num: number) {
  return smallUSDFormatter.format(num);
}

export function usdFormatter(num: number) {
  return formatter.format(num);
}

export function shortUsdFormatter(num: number) {
  return '$' + shortFormatter.format(num);
}

export function midUsdFormatter(num: number) {
  return '$' + midFormatter.format(num);
}

export function tokenFormatter(value: BigNumber, decimals: BigNumberish = 18, symbol?: string) {
  return midFormatter.format(Number(formatUnits(value, decimals))) + (symbol || '');
}

export function aprFormatter(value: BigNumber, decimals: BigNumberish = 18, symbol?: string) {
  return midFormatter.format(Number(formatUnits(value, decimals))) + (symbol || '');
}

export function longFormat(num: number) {
  return longFormatter.format(num);
}

export function midFormat(num: number) {
  return midFormatter.format(num);
}
