import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useExtraPoolInfo } from '@ui/hooks/ionic/useExtraPoolInfo';

export const useIsEditableAdmin = (comptrollerAddress?: string, poolChainId?: number) => {
  const { data: poolInfo } = useExtraPoolInfo(comptrollerAddress, poolChainId);
  const { currentChain } = useMultiIonic();

  const { data } = useQuery(
    [
      'useIsEditableAdmin',
      comptrollerAddress,
      poolInfo?.isPowerfulAdmin,
      currentChain?.id,
      poolChainId
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
      enabled:
        !!comptrollerAddress && !!poolInfo?.isPowerfulAdmin && !!currentChain?.id && !!poolChainId
    }
  );

  return data;
};
