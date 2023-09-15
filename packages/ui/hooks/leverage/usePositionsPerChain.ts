import type { SupportedChains } from '@ionicprotocol/types';
import { useQueries } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import type { Err, PositionData, PositionsPerChainStatus } from '@ui/types/ComponentPropsType';

export const usePositionsPerChain = (chainIds: SupportedChains[]) => {
  const { address, getSdk } = useMultiIonic();

  const positionQueries = useQueries({
    queries: chainIds.map((chainId) => {
      return {
        enabled: !!chainId && !!address,
        queryFn: async () => {
          const sdk = getSdk(Number(chainId));

          if (chainId && sdk && address) {
            return await sdk.getAllLeveredPositions(address).catch((e) => {
              console.warn(`Getting all levered positions error: `, { address, chainId }, e);

              return null;
            });
          } else {
            return null;
          }
        },
        queryKey: ['usePositionsPerChain', chainId, address]
      };
    })
  });

  const positionsPerChain: PositionsPerChainStatus = {};
  const allPositions: PositionData = { newPositions: [], openPositions: [] };
  let isLoading = false;
  let isError = false;
  let error: Err | undefined;

  positionQueries.map((leverage, index) => {
    isLoading = isLoading || leverage.isLoading;
    isError = isError || leverage.isError;
    error = isError ? (leverage.error as Err) : undefined;
    const _chainId = chainIds[index];
    positionsPerChain[_chainId.toString()] = {
      data: leverage.data,
      error: leverage.error as Err | undefined,
      isLoading: leverage.isLoading
    };

    if (leverage.data) {
      allPositions.newPositions.push(...leverage.data.newPositions);
      allPositions.openPositions.push(...leverage.data.openPositions);
    }
  });

  return { allPositions, error, isLoading, positionsPerChain };
};
