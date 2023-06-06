import { useQuery } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';
import { utils } from 'ethers';

import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useBaseCollateral } from '@ui/hooks/leverage/useBaseCollateral';

export function useGetNetApyAtRatio(
  position: string,
  collateralMarket: string,
  borrowableMarket: string,
  leverageRatio: BigNumber,
  supplyApy?: BigNumber,
  chainId?: number
) {
  const sdk = useSdk(chainId);
  const { data: baseCollateral } = useBaseCollateral(position, chainId);

  return useQuery(
    [
      'useGetNetApyAtRatio',
      supplyApy,
      baseCollateral,
      collateralMarket,
      borrowableMarket,
      leverageRatio,
      sdk?.chainId,
    ],
    async () => {
      if (sdk && supplyApy !== undefined && baseCollateral) {
        const netApy = await sdk.getNetAPY(
          supplyApy,
          baseCollateral,
          collateralMarket,
          borrowableMarket,
          leverageRatio
        );

        return Number(utils.formatUnits(netApy));
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      enabled: !!sdk && !!baseCollateral && supplyApy !== undefined,
      staleTime: Infinity,
    }
  );
}
