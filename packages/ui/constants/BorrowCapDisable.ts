// multipliers[+dropdownSelectedChain]?.[selectedPoolId]?.[asset]

import { base, mode } from 'viem/chains';

export const disableBorrowRepay: Record<number, Record<string, string[]>> = {
  [mode.id]: {
    '0': []
  },
  [base.id]: {
    '0': []
  }
};
