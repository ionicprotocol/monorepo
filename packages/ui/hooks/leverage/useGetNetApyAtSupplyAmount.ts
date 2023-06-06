import { useQuery } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';
import { utils } from 'ethers';

import { useSdk } from '@ui/hooks/fuse/useSdk';
import { useBaseCollateral } from '@ui/hooks/leverage/useBaseCollateral';
import { useCurrentLeverageRatio } from '@ui/hooks/leverage/useCurrentLeverageRatio';

export function useGetNetApyAtSupplyAmount(
  position: string,
  amount: BigNumber,
  collateralMarket: string,
  borrowableMarket: string,
  supplyApy?: BigNumber,
  chainId?: number
) {
  const sdk = useSdk(chainId);
  const { data: baseCollateral } = useBaseCollateral(position, chainId);
  const { data: currentLeverageRatio } = useCurrentLeverageRatio(position, chainId);

  return useQuery(
    [
      'useGetNetApyAtSupplyAmount',
      supplyApy,
      baseCollateral,
      collateralMarket,
      borrowableMarket,
      currentLeverageRatio,
      sdk?.chainId,
    ],
    async () => {
      if (sdk && supplyApy !== undefined && baseCollateral && currentLeverageRatio) {
        const netApy = await sdk.getNetAPY(
          supplyApy,
          baseCollateral.add(amount),
          collateralMarket,
          borrowableMarket,
          currentLeverageRatio
        );

        return Number(utils.formatUnits(netApy));
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      enabled: !!sdk && !!baseCollateral && !!currentLeverageRatio && supplyApy !== undefined,
      staleTime: Infinity,
    }
  );
}
