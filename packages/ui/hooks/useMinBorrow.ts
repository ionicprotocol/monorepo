import { BigNumber, Contract } from 'ethers';
import { useQuery } from 'react-query';

import { useRari } from '@ui/context/RariContext';

export function useMinBorrow() {
  const { fuse, coingeckoId } = useRari();

  return useQuery<BigNumber | undefined>(
    [`useMinBorrow`, coingeckoId],
    async () => {
      const FuseFeeDistributor = new Contract(
        fuse.chainDeployment.FuseFeeDistributor.address,
        fuse.chainDeployment.FuseFeeDistributor.abi,
        fuse.provider.getSigner()
      );

      const min = await FuseFeeDistributor.callStatic.minBorrowEth();

      return min;
    },
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!fuse }
  );
}
