import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { mode } from 'viem/chains';

import type { Address } from 'viem';

export interface MerklAprData {
  [chainId: number]: {
    [key: `${number}-${Address}`]: {
      [merkleKey: string]: {
        apr: number;
      };
    };
  };
}

export function useMerklApr() {
  return useQuery({
    queryKey: ['merklApr'],
    queryFn: async () => {
      const res = await axios.get<MerklAprData>(
        `https://api.merkl.xyz/v3/campaigns?chainIds=34443&types=1&live=true`
      );

      return Object.entries(res.data[mode.id]).map(([key, value]) => {
        return { [key.split('_')[1] as Address]: Object.values(value)[0].apr };
      });
    }
  });
}
