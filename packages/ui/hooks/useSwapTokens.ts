import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'ethers';

import { useSdk } from '@ui/hooks/ionic/useSdk';

export interface SwapTokenType {
  underlyingDecimals: BigNumber;
  underlyingSymbol: string;
  underlyingToken: string;
}

export function useSwapTokens(outputToken: string, chainId: number) {
  const sdk = useSdk(chainId);

  return useQuery<SwapTokenType[] | null>(
    ['useSwapTokens', outputToken, sdk?.chainId],
    async () => {
      if (sdk) {
        try {
          const tokens = await sdk.getSwapTokens(outputToken);

          return tokens.map((token) => {
            return {
              ...token,
              underlyingDecimals: BigNumber.from(token.underlyingDecimals),
            };
          });
        } catch (e) {
          console.error('Could not get swap tokens', { chainId, outputToken }, e);

          return null;
        }
      } else {
        return null;
      }
    },
    {
      enabled: !!outputToken && !!sdk,
    }
  );
}
