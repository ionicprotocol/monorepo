import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useExtraPoolInfo } from '@ui/hooks/fuse/useExtraPoolInfo';

export const useIsEditableAdmin = (
  comptrollerAddress?: Address,
  poolChainId?: number
) => {
  const { data: poolInfo } = useExtraPoolInfo(comptrollerAddress, poolChainId);
  const { currentChain } = useMultiIonic();

  const { data } = useQuery({
    queryKey: [
      'useIsEditableAdmin',
      comptrollerAddress,
      poolInfo?.isPowerfulAdmin,
      currentChain?.id,
      poolChainId
    ],

    queryFn: async () => {
      if (
        comptrollerAddress &&
        poolInfo?.isPowerfulAdmin &&
        currentChain &&
        currentChain.id === poolChainId
      ) {
        return true;
      } else {
        return null;
      }
    },

    gcTime: Infinity,

    enabled:
      !!comptrollerAddress &&
      !!poolInfo?.isPowerfulAdmin &&
      !!currentChain?.id &&
      !!poolChainId,

    staleTime: Infinity
  });

  return data;
};
