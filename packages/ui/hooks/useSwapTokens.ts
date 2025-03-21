import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/fuse/useSdk';

import type { Address } from 'viem';

export interface SwapTokenType {
  underlyingDecimals: bigint;
  underlyingSymbol: string;
  underlyingToken: string;
}

export function useSwapTokens(outputToken: Address, chainId: number) {
  const sdk = useSdk(chainId);

  return useQuery({
    queryKey: ['useSwapTokens', outputToken, sdk?.chainId],

    queryFn: async () => {
      if (sdk) {
        try {
          const tokens = await sdk.getSwapTokens(outputToken);

          return tokens.map((token) => {
            return {
              ...token,
              underlyingDecimals: BigInt(token.underlyingDecimals)
            };
          });
        } catch (e) {
          console.error(
            'Could not get swap tokens',
            { chainId, outputToken },
            e
          );

          return null;
        }
      } else {
        return null;
      }
    },

    enabled: !!outputToken && !!sdk,
    staleTime: Infinity
  });
}
