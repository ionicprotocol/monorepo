import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { mode } from 'viem/chains';

import type { Address } from 'viem';

export interface MerklAprData {
  [chainId: number]: {
    [key: `${number}-${Address}`]: {
      [merkleKey: string]: {
        apr: number;
        typeInfo: {
          underlying?: Address;
          poolTokens?: {
            [tokenAddress: string]: {
              symbol: string;
              decimals: number;
              amountInPool: number;
              price: number;
            };
          };
        };
      };
    };
  };
}

export function useMerklData() {
  return useQuery({
    queryKey: ['merklApr'],
    queryFn: async () => {
      const res = await axios.get<MerklAprData>(
        `https://api.merkl.xyz/v3/campaigns?chainIds=34443&types=1&live=true`
      );

      // Flatten all token-APR pairs into a single array
      return Object.entries(res.data[mode.id]).flatMap(([key, value]) => {
        const campaignData = Object.values(value)[0];
        const { apr, typeInfo } = campaignData;

        // Handle pools with multiple tokens
        if (typeInfo.poolTokens) {
          // Create separate entries for each token in the pool
          return Object.keys(typeInfo.poolTokens).map((tokenAddress) => ({
            [tokenAddress as Address]: apr
          }));
        }

        // Handle single token cases (using underlying)
        if (typeInfo.underlying) {
          return [
            {
              [typeInfo.underlying]: apr
            }
          ];
        }

        return [];
      });
    }
  });
}
