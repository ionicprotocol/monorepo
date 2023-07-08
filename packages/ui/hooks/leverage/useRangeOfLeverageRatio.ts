import { useQuery } from '@tanstack/react-query';
import { constants, utils } from 'ethers';

import { useSdk } from '@ui/hooks/fuse/useSdk';

export function useRangeOfLeverageRatio(address?: string, chainId?: number) {
  const sdk = useSdk(chainId);

  return useQuery(
    ['useRangeOfLeverageRatio', address, sdk?.chainId],
    async () => {
      if (sdk && address) {
        const [minBignum, maxBignum] = await sdk.getRangeOfLeverageRatio(address).catch((e) => {
          console.warn(`Getting range of leverage ratio error: `, { address, chainId }, e);

          return [constants.Zero, constants.Zero];
        });

        return {
          max: Number(Number(utils.formatUnits(maxBignum)).toFixed(3)),
          min: Number(Number(utils.formatUnits(minBignum)).toFixed(3)),
        };
      } else {
        return null;
      }
    },
    {
      enabled: !!address && !!sdk,
    }
  );
}
