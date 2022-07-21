import { format } from 'mathjs';

export const toFixedNoRound = (value: number, len: number) => {
  const factor = Math.pow(10, len);
  const val = Math.floor(value * factor) / factor;
  const str = format(val, { notation: 'fixed' });

  return str;
};
