import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useExtraPoolInfo } from '@ui/hooks/fuse/useExtraPoolInfo';

export const useIsEditableAdmin = (comptrollerAddress?: string, poolChainId?: number) => {
  const { data: poolInfo } = useExtraPoolInfo(comptrollerAddress, poolChainId);
  const { currentChain } = useMultiIonic();

  const { data } = useQuery(
    [
      'useIsEditableAdmin',
      comptrollerAddress,
      poolInfo?.isPowerfulAdmin,
      currentChain?.id,
      poolChainId,
    ],
    async () => {
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
    {
      cacheTime: Infinity,
      enabled:
        !!comptrollerAddress && !!poolInfo?.isPowerfulAdmin && !!currentChain?.id && !!poolChainId,
      staleTime: Infinity,
    }
  );

  return data;
};
