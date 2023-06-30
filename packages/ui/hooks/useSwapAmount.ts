import { useQuery } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';

import { useSdk } from '@ui/hooks/fuse/useSdk';

export interface SwapTokenType {
  underlyingDecimals: BigNumber;
  underlyingSymbol: string;
  underlyingToken: string;
}

export function useSwapAmount(
  inputToken?: string,
  amount?: BigNumber,
  outputToken?: string,
  chainId?: number
) {
  const sdk = useSdk(chainId);

  return useQuery<BigNumber | null>(
    ['useSwapAmount', inputToken, amount, outputToken, sdk?.chainId],
    async () => {
      if (sdk && inputToken && amount && outputToken) {
        try {
          return await sdk.getSwapAmount(inputToken, amount, outputToken);
        } catch (e) {
          console.error(
            'Could not get swap amount',
            { amount, chainId, inputToken, outputToken },
            e
          );

          return null;
        }
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      enabled: !!inputToken && !!amount && !!outputToken && !!sdk,
      staleTime: Infinity,
    }
  );
}
