import { bignumber, divide, format, multiply } from 'mathjs';

export const toFixedNoRound = (value: string, len: number) => {
  const factor = Math.pow(10, len);
  const val1 = multiply(bignumber(value), bignumber(factor));
  const val2 = format(val1, { notation: 'fixed' });
  const val3 = val2.split('.')[0];
  const val4 = divide(bignumber(val3), bignumber(factor));
  const str = format(val4, { notation: 'fixed' });

  return str;
};
