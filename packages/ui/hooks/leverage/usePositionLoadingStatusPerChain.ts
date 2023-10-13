import { useQuery } from '@tanstack/react-query';

import type { PositionsPerChainStatus } from '@ui/types/ComponentPropsType';

export const usePositionLoadingStatusPerChain = (positionsPerChain: PositionsPerChainStatus) => {
  const response = useQuery(
    [
      'usePositionLoadingStatusPerChain',
      Object.entries(positionsPerChain).map(([chainId, leverage]) => chainId + leverage.isLoading)
    ],
    () => {
      const _loadingStatusPerChain: { [chainId: string]: boolean } = {};

      Object.entries(positionsPerChain).map(([chainId, leverage]) => {
        _loadingStatusPerChain[chainId] = leverage.isLoading;
      });

      return _loadingStatusPerChain;
    },
    {
      enabled: Object.values(positionsPerChain).length > 0
    }
  );

  return response.data ?? {};
};
